import { db } from '../lib/prisma';
import { KpiCalcLogic, KpiStatus } from '@prisma/client';

async function seedKpiData() {
  console.log('🌱 Seeding KPI data...');

  // Clean existing KPI data
  console.log('🧹 Cleaning existing KPI data...');
  await db.kpiQuarterlyData.deleteMany();
  await db.kpiAnnualData.deleteMany();
  await db.kpiMaster.deleteMany();
  await db.kpiObjective.deleteMany();
  await db.kpiPlan.deleteMany();
  await db.kpiStrategy.deleteMany();
  await db.kpiIndicator.deleteMany();

  // 1. Create Indicators
  const indicators = await Promise.all([
    db.kpiIndicator.create({
      data: { code: 'IN01', name: 'โรงพยาบาล' },
    }),
    db.kpiIndicator.create({
      data: { code: 'IN02', name: 'จังหวัด' },
    }),
    db.kpiIndicator.create({
      data: { code: 'IN03', name: 'ประเทศ' },
    }),
  ]);
  console.log(`✅ Created ${indicators.length} indicators`);

  // 2. Create Strategies
  const strategies = await Promise.all([
    db.kpiStrategy.create({
      data: {
        code: 'S01',
        name: '1.ยกระดับความมั่นคงทางการเงินด้วยระบบบริหารจัดการที่มีประสิทธิภาพ',
      },
    }),
    db.kpiStrategy.create({
      data: {
        code: 'S02',
        name: '2.พัฒนาเทคโนโลยีสารสนเทศเพื่อการบริหาร บริการที่มีประสิทธิภาพ',
      },
    }),
    db.kpiStrategy.create({
      data: {
        code: 'S03',
        name: '3.พัฒนาศักยภาพของบุคลากรด้านนวัตกรรม',
      },
    }),
    db.kpiStrategy.create({
      data: {
        code: 'S04',
        name: '4.พัฒนาระบบบริการสุขภาพที่มีคุณภาพ',
      },
    }),
    db.kpiStrategy.create({
      data: {
        code: 'S05',
        name: '5.สร้างเสริมชุมชนจัดการสุขภาพ โรคไม่ติดต่อเรื้อรัง',
      },
    }),
  ]);
  console.log(`✅ Created ${strategies.length} strategies`);

  // 3. Create Plans
  const plans = await Promise.all([
    db.kpiPlan.create({
      data: {
        code: 'P01',
        name: 'แผนพัฒนาระบบบริการสุขภาพ 5 ปี',
        strategyId: strategies[4].id, // S05
      },
    }),
    db.kpiPlan.create({
      data: {
        code: 'P02',
        name: 'แผนพัฒนาเทคโนโลยีสารสนเทศ',
        strategyId: strategies[1].id, // S02
      },
    }),
  ]);
  console.log(`✅ Created ${plans.length} plans`);

  // 4. Create Objectives
  const objectives = await Promise.all([
    db.kpiObjective.create({
      data: {
        code: 'OBJ01',
        name: 'เพิ่มกำไร',
        strategyId: strategies[0].id, // S01
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ02',
        name: 'เพิ่มรายได้',
        strategyId: strategies[0].id, // S01
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ03',
        name: 'ลดต้นทุน',
        strategyId: strategies[0].id, // S01
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ04',
        name: 'เพิ่มประสิทธิภาพการบริหารจัดการ และบริการทางการแพทย์ด้วยเทคโนโลยี',
        strategyId: strategies[1].id, // S02
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ05',
        name: 'พัฒนาระบบสารสนเทศ',
        strategyId: strategies[1].id, // S02
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ06',
        name: 'เพื่อเพิ่มขีดความสามารถของบุคลากรในการประยุกต์ใช้เทคโนโลยี',
        strategyId: strategies[2].id, // S03
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ07',
        name: 'พัฒนาทักษะบุคลากร',
        strategyId: strategies[2].id, // S03
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ08',
        name: 'ยกระดับคุณภาพการบริการ',
        strategyId: strategies[3].id, // S04
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ09',
        name: 'เพิ่มความพึงพอใจของผู้รับบริการ',
        strategyId: strategies[3].id, // S04
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ10',
        name: 'ป้องกันและควบคุมโรคเรื้อรัง',
        strategyId: strategies[4].id, // S05
        planId: plans[0].id,
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ11',
        name: 'เบาหวานควบคุมได้ ลดอัตราการเกิดผู้ป่วยเบาหวานรายใหม่',
        strategyId: strategies[4].id, // S05
        planId: plans[0].id,
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ12',
        name: 'ควบคุมความดันโลหิต',
        strategyId: strategies[4].id, // S05
        planId: plans[0].id,
      },
    }),
    db.kpiObjective.create({
      data: {
        code: 'OBJ13',
        name: 'การชะลอความเสื่อมของไตในผู้ป่วยโรคไตวายเรื้อรัง',
        strategyId: strategies[4].id, // S05
        planId: plans[0].id,
      },
    }),
  ]);
  console.log(`✅ Created ${objectives.length} objectives`);

  // 5. Create KPI Master Data
  const kpiMaster = await Promise.all([
    // S01 - Financial Strategy
    db.kpiMaster.create({
      data: {
        code: 'KPI01',
        name: 'รายได้จากผู้รับบริการเพิ่มขึ้นจากปีที่ผ่านมา',
        targetText: 'มากกว่าหรือเท่ากับร้อยละ 5',
        fiveYearTargetText: 'มากกว่าหรือเท่ากับร้อยละ 5',
        fiveYearTargetValue: 5,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานการเงิน',
        isActive: true,
        objectiveId: objectives[1].id, // OBJ02
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI02',
        name: 'ต้นทุนยาและเวชภัณฑ์ลดลง',
        targetText: 'ลดลงร้อยละ 5',
        fiveYearTargetText: 'ลดลงร้อยละ 5',
        fiveYearTargetValue: 5,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานเภสัชกรรม',
        isActive: true,
        objectiveId: objectives[2].id, // OBJ03
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI03',
        name: 'รายได้จากการเพิ่มช่องทางการให้บริการใหม่ (ศูนย์ฟอกเลือดด้วยเครื่องไตเทียม)',
        targetText: 'ระดับ 5',
        fiveYearTargetText: 'ระดับ 5',
        fiveYearTargetValue: 5,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานอายุรกรรม',
        isActive: true,
        objectiveId: objectives[1].id, // OBJ02
        indicatorId: indicators[0].id, // IN01
      },
    }),

    // S02 - IT Strategy
    db.kpiMaster.create({
      data: {
        code: 'KPI04',
        name: 'ระดับความสำเร็จของการพัฒนาระบบ HIS',
        targetText: 'ระดับ 4',
        fiveYearTargetText: 'ระดับ 5',
        fiveYearTargetValue: 5,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานสารสนเทศ',
        isActive: true,
        objectiveId: objectives[4].id, // OBJ05
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI05',
        name: 'ระดับความสำเร็จของการพัฒนาระบบ Telemedicine',
        targetText: 'ระดับ 3',
        fiveYearTargetText: 'ระดับ 5',
        fiveYearTargetValue: 5,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานสารสนเทศ',
        isActive: true,
        objectiveId: objectives[3].id, // OBJ04
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI06',
        name: 'ระดับความสำเร็จของการพัฒนาระบบ E-Claim',
        targetText: 'ระดับ 4',
        fiveYearTargetText: 'ระดับ 5',
        fiveYearTargetValue: 5,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานสารสนเทศ',
        isActive: true,
        objectiveId: objectives[3].id, // OBJ04
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI07',
        name: 'ระดับความสำเร็จของการพัฒนาระบบ BI Dashboard',
        targetText: 'ระดับ 3',
        fiveYearTargetText: 'ระดับ 4',
        fiveYearTargetValue: 4,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานสารสนเทศ',
        isActive: true,
        objectiveId: objectives[3].id, // OBJ04
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI08',
        name: 'ระดับความสำเร็จของการพัฒนา Dashboard',
        targetText: 'มากกว่าหรือเท่ากับระดับ 3',
        fiveYearTargetText: 'มากกว่าหรือเท่ากับระดับ 3',
        fiveYearTargetValue: 3,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานสารสนเทศ',
        isActive: true,
        objectiveId: objectives[3].id, // OBJ04
        indicatorId: indicators[0].id, // IN01
      },
    }),

    // S03 - HR Development
    db.kpiMaster.create({
      data: {
        code: 'KPI09',
        name: 'ร้อยละของบุคลากรที่ผ่านการอบรมด้านเทคโนโลยี',
        targetText: 'มากกว่าหรือเท่ากับร้อยละ 80',
        fiveYearTargetText: 'มากกว่าหรือเท่ากับร้อยละ 90',
        fiveYearTargetValue: 90,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานทรัพยากรบุคคล',
        isActive: true,
        objectiveId: objectives[6].id, // OBJ07
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI10',
        name: 'จำนวนนวัตกรรมที่พัฒนาโดยบุคลากร',
        targetText: 'มากกว่าหรือเท่ากับ 5 นวัตกรรม',
        fiveYearTargetText: 'มากกว่าหรือเท่ากับ 10 นวัตกรรม',
        fiveYearTargetValue: 10,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานพัฒนาคุณภาพ',
        isActive: true,
        objectiveId: objectives[6].id, // OBJ07
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI11',
        name: 'ระดับความสำเร็จของการพัฒนาศักยภาพบุคลากร โรงพยาบาลลอง ด้านเทคโนโลยีปัญญาประดิษฐ์ เพื่อพัฒนางานประจำ',
        targetText: 'ระดับ 4',
        fiveYearTargetText: 'ระดับ 4',
        fiveYearTargetValue: 4,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานทรัพยากรบุคคล',
        isActive: true,
        objectiveId: objectives[5].id, // OBJ06
        indicatorId: indicators[0].id, // IN01
      },
    }),

    // S04 - Service Quality
    db.kpiMaster.create({
      data: {
        code: 'KPI12',
        name: 'ระดับความพึงพอใจของผู้รับบริการ',
        targetText: 'มากกว่าหรือเท่ากับร้อยละ 85',
        fiveYearTargetText: 'มากกว่าหรือเท่ากับร้อยละ 90',
        fiveYearTargetValue: 90,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานพัฒนาคุณภาพ',
        isActive: true,
        objectiveId: objectives[8].id, // OBJ09
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI13',
        name: 'อัตราการรอคอยเฉลี่ย OPD',
        targetText: 'น้อยกว่าหรือเท่ากับ 30 นาที',
        fiveYearTargetText: 'น้อยกว่าหรือเท่ากับ 20 นาที',
        fiveYearTargetValue: 20,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.LTE,
        owner: 'กลุ่มงานผู้ป่วยนอก',
        isActive: true,
        objectiveId: objectives[7].id, // OBJ08
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI14',
        name: 'อัตราการติดเชื้อในโรงพยาบาล',
        targetText: 'น้อยกว่าหรือเท่ากับร้อยละ 2',
        fiveYearTargetText: 'น้อยกว่าหรือเท่ากับร้อยละ 1',
        fiveYearTargetValue: 1,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.LTE,
        owner: 'กลุ่มงานควบคุมการติดเชื้อ',
        isActive: true,
        objectiveId: objectives[7].id, // OBJ08
        indicatorId: indicators[0].id, // IN01
      },
    }),

    // S05 - Community Health
    db.kpiMaster.create({
      data: {
        code: 'KPI15',
        name: 'ร้อยละของผู้ป่วยเบาหวานที่ได้รับการคัดกรอง',
        targetText: 'มากกว่าหรือเท่ากับร้อยละ 70',
        fiveYearTargetText: 'มากกว่าหรือเท่ากับร้อยละ 80',
        fiveYearTargetValue: 80,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานเวชกรรมสังคม',
        isActive: true,
        objectiveId: objectives[10].id, // OBJ11
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI16',
        name: 'อัตราการเกิดภาวะแทรกซ้อนจากเบาหวาน',
        targetText: 'น้อยกว่าหรือเท่ากับร้อยละ 10',
        fiveYearTargetText: 'น้อยกว่าหรือเท่ากับร้อยละ 5',
        fiveYearTargetValue: 5,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.LTE,
        owner: 'กลุ่มงานเวชกรรมสังคม',
        isActive: true,
        objectiveId: objectives[10].id, // OBJ11
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI17',
        name: 'ร้อยละของผู้ป่วยความดันโลหิตสูงที่ควบคุมได้',
        targetText: 'มากกว่าหรือเท่ากับร้อยละ 50',
        fiveYearTargetText: 'มากกว่าหรือเท่ากับร้อยละ 60',
        fiveYearTargetValue: 60,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานเวชกรรมสังคม',
        isActive: true,
        objectiveId: objectives[11].id, // OBJ12
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI18',
        name: 'ผู้ป่วยโรคเบาหวานที่ควบคุมระดับน้ำตาลได้ดี',
        targetText: 'มากกว่าหรือเท่ากับร้อยละ 40',
        fiveYearTargetText: 'มากกว่าหรือเท่ากับร้อยละ 40',
        fiveYearTargetValue: 40,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานเวชกรรมสังคม',
        isActive: true,
        objectiveId: objectives[10].id, // OBJ11
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI19',
        name: 'อัตราการชะลอความเสื่อมของไตในผู้ป่วย CKD',
        targetText: 'มากกว่าหรือเท่ากับร้อยละ 60',
        fiveYearTargetText: 'มากกว่าหรือเท่ากับร้อยละ 70',
        fiveYearTargetValue: 70,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานอายุรกรรม',
        isActive: true,
        objectiveId: objectives[12].id, // OBJ13
        indicatorId: indicators[0].id, // IN01
      },
    }),
    db.kpiMaster.create({
      data: {
        code: 'KPI20',
        name: 'จำนวนชุมชนที่เข้าร่วมโครงการสร้างเสริมสุขภาพ',
        targetText: 'มากกว่าหรือเท่ากับ 15 ชุมชน',
        fiveYearTargetText: 'มากกว่าหรือเท่ากับ 20 ชุมชน',
        fiveYearTargetValue: 20,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: KpiCalcLogic.GTE,
        owner: 'กลุ่มงานเวชกรรมสังคม',
        isActive: true,
        objectiveId: objectives[9].id, // OBJ10
        indicatorId: indicators[0].id, // IN01
      },
    }),
  ]);
  console.log(`✅ Created ${kpiMaster.length} KPIs`);

  // 6. Create Quarterly Data for all KPIs (Year 2569)
  console.log('📊 Creating quarterly data...');
  const quarterlyData = [];
  
  for (const kpi of kpiMaster) {
    // Sample quarterly targets and results
    const quarters = [
      { q: 1, target: '25', result: '22', status: KpiStatus.PENDING },
      { q: 2, target: '50', result: '48', status: KpiStatus.PENDING },
      { q: 3, target: '75', result: '73', status: KpiStatus.PENDING },
      { q: 4, target: '100', result: '95', status: KpiStatus.PASSED },
    ];

    for (const quarter of quarters) {
      quarterlyData.push({
        kpiId: kpi.id,
        year: 2569,
        quarter: quarter.q,
        quarterlyTarget: quarter.target,
        result: quarter.result,
        status: quarter.status,
      });
    }
  }

  await db.kpiQuarterlyData.createMany({
    data: quarterlyData,
    skipDuplicates: true,
  });
  console.log(`✅ Created ${quarterlyData.length} quarterly records`);

  // 7. Create Annual Data for all KPIs (5-year plan)
  console.log('📈 Creating annual data...');
  const annualData = [];
  
  for (const kpi of kpiMaster) {
    const baseTarget = Number(kpi.fiveYearTargetValue) || 100;
    
    for (let year = 2569; year <= 2573; year++) {
      const yearIndex = year - 2569;
      const target = baseTarget * (yearIndex + 1) / 5;
      const result = target * (0.85 + Math.random() * 0.2); // 85-105% of target
      
      annualData.push({
        kpiId: kpi.id,
        year: year,
        yearTarget: target,
        yearResult: result,
      });
    }
  }

  await db.kpiAnnualData.createMany({
    data: annualData,
    skipDuplicates: true,
  });
  console.log(`✅ Created ${annualData.length} annual records`);

  console.log('🎉 KPI seed data complete!');
  console.log(`📊 Summary:`);
  console.log(`   - Indicators: ${indicators.length}`);
  console.log(`   - Strategies: ${strategies.length}`);
  console.log(`   - Plans: ${plans.length}`);
  console.log(`   - Objectives: ${objectives.length}`);
  console.log(`   - KPIs: ${kpiMaster.length}`);
  console.log(`   - Quarterly Data: ${quarterlyData.length}`);
  console.log(`   - Annual Data: ${annualData.length}`);
}

export default seedKpiData;
