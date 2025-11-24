/**
 * @OnlyCurrentDoc
 * This script works with a 7-sheet data structure:
 * 1. Indicator, 2. Strategies, 3. Plans, 4. Objectives, 5. KPI_Master, 6. Data_Quarterly, 7. Data_Annual
 */

function doGet() {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("KPI Dashboard รพ.ลอง")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const indicatorMap = getSheetDataAsMap(ss, "Indicator", "Indicator_ID");
    const strategiesMap = getSheetDataAsMap(ss, "Strategies", "StrategyID");
    const plansMap = getSheetDataAsMap(ss, "Plans", "PlanID");
    const objectivesMap = getSheetDataAsMap(ss, "Objectives", "ObjectiveID");
    const kpiMasterMap = getSheetDataAsMap(ss, "KPI_Master", "KPI_ID");

    // --- NEW: Load Annual Data and group by KPI_ID ---
    const annualData = getSheetDataAsArray(ss, "Data_5year");
    const annualDataGrouped = annualData.reduce((acc, item) => {
      const key = item.KPI_ID;
      if (key) {
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
      }
      return acc;
    }, {});

    const quarterlySheet = ss.getSheetByName("Data_Quarterly");
    if (!quarterlySheet) return [];
    const quarterlyRange = quarterlySheet.getRange(
      2,
      1,
      quarterlySheet.getLastRow() - 1,
      quarterlySheet.getLastColumn()
    );
    const quarterlyValues = quarterlyRange.getValues();
    const quarterlyHeaders = quarterlySheet
      .getRange(1, 1, 1, quarterlySheet.getLastColumn())
      .getValues()[0];

    const combinedData = quarterlyValues
      .map((row) => {
        const getRowData = (headerName) =>
          row[quarterlyHeaders.indexOf(headerName)];
        const kpiId = getRowData("KPI_ID")?.toString().trim();
        if (!kpiId) return null;

        const kpiData = kpiMasterMap[kpiId];
        if (!kpiData) return null;

        const objectiveData =
          objectivesMap[kpiData.ObjectiveID?.toString().trim()];
        if (!objectiveData) return null;

        const indicatorData =
          indicatorMap[kpiData.IndicatorLevel?.toString().trim()];
        if (!indicatorData) return null;

        const planData =
          plansMap[objectiveData.PlanID?.toString().trim()] || {};
        const strategyId =
          objectiveData.StrategyID?.toString().trim() ||
          planData.StrategyID?.toString().trim();
        if (!strategyId) return null;

        const strategyData = strategiesMap[strategyId];
        if (!strategyData) return null;

        const result = getRowData("Result");
        const quarterlyTarget = getRowData("TargetQuarter");
        const status = getStatus(result, quarterlyTarget, kpiData.CalcLogic);

        return {
          strategyId,
          strategyName: strategyData.StrategyName,
          planName: planData.PlanName,
          objectiveName: objectiveData.ObjectiveName,
          kpiId,
          kpiName: kpiData.KPIName,
          kpiTargetText: kpiData.TargetText,
          indicatorId: kpiData.IndicatorLevel,
          indicatorName: indicatorData.IndicatorName,
          calcLogic: kpiData.CalcLogic,
          owner: kpiData.Owner,
          year: getRowData("Year"),
          quarter: getRowData("Quarter"),
          quarterlyTarget,
          result,
          status,
          fiveYearPlanPeriod: kpiData.FiveYearPlanPeriod,
          isActive: kpiData.IsActive,
          // --- NEW: Attach the grouped annual data ---
          annualData: annualDataGrouped[kpiId] || [],
        };
      })
      .filter((item) => item);

    return combinedData;
  } catch (e) {
    Logger.log(
      `An error occurred in getData: ${e.message} \nStack: ${e.stack}`
    );
    return [];
  }
}

function getStatus(result, quarterlyTarget, calcLogic = "GTE") {
  if (
    result === "" ||
    result === null ||
    quarterlyTarget === "" ||
    quarterlyTarget === null
  )
    return "รอข้อมูล";
  const resultValue = parseFloat(result);
  const targetValue = parseFloat(quarterlyTarget);
  if (isNaN(resultValue) || isNaN(targetValue)) {
    if (
      `${calcLogic}`.toUpperCase() === "EQT" &&
      `${result}`.trim() === `${quarterlyTarget}`.trim()
    )
      return "ผ่าน";
    return "ข้อมูลผิดพลาด";
  }
  try {
    switch (`${calcLogic}`.toUpperCase()) {
      case "LTE":
        return resultValue <= targetValue ? "ผ่าน" : "ไม่ผ่าน";
      case "EQ0":
        return resultValue === 0 ? "ผ่าน" : "ไม่ผ่าน";
      case "EQT":
        return result.toString().trim() === quarterlyTarget.toString().trim()
          ? "ผ่าน"
          : "ไม่ผ่าน";
      case "GTE":
      default:
        return resultValue >= targetValue ? "ผ่าน" : "ไม่ผ่าน";
    }
  } catch (e) {
    return "คำนวณผิดพลาด";
  }
}

function getSheetDataAsMap(ss, sheetName, keyColumn) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log(`Sheet "${sheetName}" not found.`);
    return {};
  }
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const map = {};
  const keyIndex = headers.indexOf(keyColumn);
  if (keyIndex === -1) {
    Logger.log(`Key "${keyColumn}" not found in "${sheetName}".`);
    return {};
  }

  data.forEach((row) => {
    const key = row[keyIndex]?.toString().trim();
    if (key) {
      map[key] = {};
      headers.forEach((header, index) => {
        map[key][header] = row[index];
      });
    }
  });
  return map;
}

// --- NEW: Helper to get data as a simple array of objects ---
function getSheetDataAsArray(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log(`Sheet "${sheetName}" not found.`);
    return [];
  }
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}
