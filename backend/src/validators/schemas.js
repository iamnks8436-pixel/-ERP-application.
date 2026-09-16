const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const customerSchema = z.object({
  body: z.object({
    companyName: z.string().min(1, 'Company name is required').max(200),
    contactPerson: z.string().min(1, 'Contact person is required').max(100),
    mobile: z.string().min(10, 'Valid mobile number is required').max(15),
    email: z.string().email('Valid email is required'),
    city: z.string().min(1, 'City is required').max(100),
  }),
});

const enquiryItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

const enquirySchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID').optional(),
    customer: customerSchema.shape.body.optional(),
    requiredDate: z.string().datetime({ message: 'Required date must be ISO datetime' }),
    notes: z.string().max(1000).optional(),
    items: z.array(enquiryItemSchema).min(1, 'At least one product is required'),
  }).refine((data) => data.customerId || data.customer, {
    message: 'Either customerId or customer details are required',
  }),
});

const quotationItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
  discountPct: z.number().min(0).max(100).optional().default(0),
  gstPct: z.number().min(0).max(100).optional().default(18),
});

const quotationSchema = z.object({
  body: z.object({
    enquiryId: z.string().uuid('Invalid enquiry ID'),
    validUntil: z.string().datetime({ message: 'Valid until must be ISO datetime' }),
    items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
  }),
});

const quotationStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid quotation ID'),
  }),
  body: z.object({
    status: z.enum(['SENT', 'ACCEPTED', 'REJECTED']),
  }),
});

const convertQuotationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid quotation ID'),
  }),
});

const confirmOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sales order ID'),
  }),
});

const dispatchSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid sales order ID'),
  }),
  body: z.object({
    vehicleNumber: z.string().min(1, 'Vehicle number is required').max(20),
    driverName: z.string().min(1, 'Driver name is required').max(100),
    items: z.array(z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: z.number().int().positive('Quantity must be positive'),
    })).min(1, 'At least one dispatch item is required'),
  }),
});

module.exports = {
  loginSchema,
  customerSchema,
  enquirySchema,
  quotationSchema,
  quotationStatusSchema,
  convertQuotationSchema,
  confirmOrderSchema,
  dispatchSchema,
};
