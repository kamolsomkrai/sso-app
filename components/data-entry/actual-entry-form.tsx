'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn, getCurrentFiscalYear } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

import { ComboboxData } from '@/lib/types';
import { CascadingCombobox } from './cascading-combobox';

// --- Zod Schema ---
const formSchema = z.object({
  entryDate: z.date({
    required_error: 'กรุณาเลือกวันที่',
  }),
  l1CategoryId: z.string().min(1, 'กรุณาเลือกประเภท (L1)'),
  l2CategoryId: z.string().min(1, 'กรุณาเลือกหมวดหมู่ (L2)'),
  l3CategoryId: z.string().min(1, 'กรุณาเลือกหมวดหมู่ (L3)'),
  l4CategoryId: z.string().optional(), // L4 อาจจะไม่มี
  procurementItemId: z.string().optional(), // Item อาจจะไม่มี
  amount: z
    .string()
    .min(1, 'กรุณาใส่จำนวนเงิน')
    .refine((val) => !isNaN(parseFloat(val)), {
      message: 'จำนวนเงินต้องเป็นตัวเลข',
    }),
  quantity: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// --- API Fetchers ---
const fetchCategories = async (
  level: number,
  parentId?: string,
): Promise<ComboboxData[]> => {
  if (level > 1 && !parentId) return []; // L2+ needs parent
  const { data } = await axios.get('/api/categories', {
    params: { level, parentId },
  });
  return data;
};

const fetchItems = async (
  l4CategoryId?: string,
): Promise<ComboboxData[]> => {
  if (!l4CategoryId) return [];
  const { data } = await axios.get('/api/items', {
    params: { categoryId: l4CategoryId },
  });
  return data;
};

// --- Main Component ---
export function ActualEntryForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedL1Type, setSelectedL1Type] = React.useState<'revenue' | 'expense' | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryDate: new Date(),
      l1CategoryId: '',
      l2CategoryId: '',
      l3CategoryId: '',
      l4CategoryId: '',
      procurementItemId: '',
      amount: '',
      quantity: '',
      notes: '',
    },
  });

  const { watch, setValue } = form;
  const watchL1 = watch('l1CategoryId');
  const watchL2 = watch('l2CategoryId');
  const watchL3 = watch('l3CategoryId');
  const watchL4 = watch('l4CategoryId');

  // --- Cascading Query Logic ---
  const { data: l1Categories, isLoading: isLoadingL1 } = useQuery<ComboboxData[]>({
    queryKey: ['categories', 1],
    queryFn: () => fetchCategories(1),
  });

  const { data: l2Categories, isLoading: isLoadingL2 } = useQuery<ComboboxData[]>({
    queryKey: ['categories', 2, watchL1],
    queryFn: () => fetchCategories(2, watchL1),
    enabled: !!watchL1,
  });

  const { data: l3Categories, isLoading: isLoadingL3 } = useQuery<ComboboxData[]>({
    queryKey: ['categories', 3, watchL2],
    queryFn: () => fetchCategories(3, watchL2),
    enabled: !!watchL2,
  });

  const { data: l4Categories, isLoading: isLoadingL4 } = useQuery<ComboboxData[]>({
    queryKey: ['categories', 4, watchL3],
    queryFn: () => fetchCategories(4, watchL3),
    enabled: !!watchL3,
  });

  const { data: items, isLoading: isLoadingItems } = useQuery<ComboboxData[]>({
    queryKey: ['items', watchL4],
    queryFn: () => fetchItems(watchL4),
    enabled: !!watchL4 && selectedL1Type === 'expense', // Items for expenses only
  });

  // --- Reset child fields on parent change ---
  React.useEffect(() => {
    setValue('l2CategoryId', '');
    setValue('l3CategoryId', '');
    setValue('l4CategoryId', '');
    setValue('procurementItemId', '');
    // Set type (revenue/expense)
    const type = l1Categories?.find(c => c.value === watchL1)?.label === 'รายรับ' ? 'revenue' : 'expense';
    setSelectedL1Type(type);
  }, [watchL1, setValue, l1Categories]);

  React.useEffect(() => {
    setValue('l3CategoryId', '');
    setValue('l4CategoryId', '');
    setValue('procurementItemId', '');
  }, [watchL2, setValue]);

  React.useEffect(() => {
    setValue('l4CategoryId', '');
    setValue('procurementItemId', '');
  }, [watchL3, setValue]);

  React.useEffect(() => {
    setValue('procurementItemId', '');
  }, [watchL4, setValue]);


  // --- Mutation (Submit) ---
  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (!user) throw new Error('User not authenticated');

      const fiscalYear = getCurrentFiscalYear();

      // Determine the most specific categoryId to send
      const categoryId =
        values.l4CategoryId ||
        values.l3CategoryId ||
        values.l2CategoryId ||
        values.l1CategoryId;

      const payload = {
        ...values,
        userId: user.id,
        amount: parseFloat(values.amount),
        quantity: values.quantity ? parseInt(values.quantity) : null,
        fiscalYear: fiscalYear,
        month: values.entryDate.getMonth() + 1,
        categoryId: categoryId,
        procurementItemId: values.procurementItemId || null, // Send null if empty
      };

      return axios.post('/api/entries', payload);
    },
    onSuccess: () => {
      toast.success('บันทึกข้อมูลสำเร็จ!');
      form.reset({
        ...form.getValues(), // Keep L1-L3 selection
        l4CategoryId: '',
        procurementItemId: '',
        amount: '',
        quantity: '',
        notes: '',
      });
      // Invalidate queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
      queryClient.invalidateQueries({ queryKey: ['expenseDrilldownL2'] });
    },
    onError: (error) => {
      toast.error('เกิดข้อผิดพลาดในการบันทึก', {
        description: error.message,
      });
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Row 1: Date & Amount --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="entryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>วันที่เกิดรายการ*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: th })
                        ) : (
                          <span>เลือกวันที่</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('2020-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>จำนวนเงิน (บาท)*</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- Row 2: Cascading Categories --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="l1CategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ประเภท (L1)*</FormLabel>
                <CascadingCombobox
                  data={l1Categories}
                  isLoading={isLoadingL1}
                  value={field.value}
                  onSelect={field.onChange}
                  placeholder="เลือก L1..."
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="l2CategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>หมวดหมู่ (L2)*</FormLabel>
                <CascadingCombobox
                  data={l2Categories}
                  isLoading={isLoadingL2}
                  value={field.value}
                  onSelect={field.onChange}
                  placeholder="เลือก L2..."
                  disabled={!watchL1}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="l3CategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>หมวดหมู่ (L3)*</FormLabel>
                <CascadingCombobox
                  data={l3Categories}
                  isLoading={isLoadingL3}
                  value={field.value}
                  onSelect={field.onChange}
                  placeholder="เลือก L3..."
                  disabled={!watchL2}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- Row 3: L4 & Item (Optional) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="l4CategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>หมวดหมู่ (L4)</FormLabel>
                <CascadingCombobox
                  data={l4Categories}
                  isLoading={isLoadingL4}
                  value={field.value}
                  onSelect={field.onChange}
                  placeholder="เลือก L4 (ถ้ามี)..."
                  disabled={!watchL3 || (l4Categories && l4Categories.length === 0)}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedL1Type === 'expense' && (
            <FormField
              control={form.control}
              name="procurementItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายการ (Item)</FormLabel>
                  <CascadingCombobox
                    data={items}
                    isLoading={isLoadingItems}
                    value={field.value}
                    onSelect={field.onChange}
                    placeholder="เลือก Item (ถ้ามี)..."
                    disabled={!watchL4 || (items && items.length === 0)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* --- Row 4: Quantity & Notes --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>จำนวน (หน่วย)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormDescription>
                  กรอกจำนวน (ถ้ามี) เช่น 100 กล่อง, 50 ชิ้น
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>หมายเหตุ</FormLabel>
                <FormControl>
                  <Textarea placeholder="รายละเอียดเพิ่มเติม..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          บันทึกข้อมูล
        </Button>
      </form>
    </Form>
  );
}