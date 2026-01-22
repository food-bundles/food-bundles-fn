# Promo Code Implementation - Checkout Page

## Overview
The promo code functionality is **already fully implemented** in the checkout page. This document explains how it works and how to use it.

## Implementation Details

### 1. **Request Body Structure**

When a promo code is applied, it's included in the checkout request:

```json
{
  "cartId": "9d800fc0-c15d-4cb7-8698-25edef6f15b9",
  "paymentMethodId": "dbb58e57-fb7e-4e89-a6cb-a96184d5da2d",
  "promoCode": "TEST20",  // ← Promo code field
  "billingPhone": "250788123456",
  "billingAddress": "123 Main St",
  "notes": "Special instructions",
  "deliveryDate": "2023-06-30",
  "otherServices": false
}
```

### 2. **Validation Flow**

#### Frontend Validation (`delivery-form.tsx`)
The promo code is validated **before** checkout submission:

1. **User enters promo code** in the input field (lines 656-680)
2. **Clicks "Apply" button** or presses Enter
3. **`handleApplyPromo` function** is triggered (lines 137-163):
   - Calls `promoService.validatePromo(code, { orderAmount: totalAmount })`
   - Validates against the `/promo/validate/{code}` endpoint
   - Checks:
     - Code exists and is active
     - Not expired
     - Minimum order amount met
     - Restaurant not excluded
     - Usage limits not exceeded
     - Applicable to cart items

4. **If valid**:
   - Promo details are stored in `appliedPromo` state
   - Discount is calculated and displayed
   - Success toast notification shown
   - Applied promo badge displayed (lines 682-696)

5. **If invalid**:
   - Error message displayed
   - Error toast notification shown

#### Backend Validation (Server-side)
When checkout is submitted with a promo code:
- The backend re-validates the promo code
- Applies the discount to the order
- Returns the final order details with discount applied

### 3. **Discount Calculation**

The discount is calculated in real-time (lines 334-342):

```typescript
let promoDiscount = 0;
if (appliedPromo) {
  if (appliedPromo.discountType === "PERCENTAGE") {
    promoDiscount = (totalAmount * appliedPromo.discountValue) / 100;
  } else {
    promoDiscount = appliedPromo.discountValue;
  }
}

const finalTotal = Math.max(0, totalAmount + packagingFee - promoDiscount);
```

**Discount Types:**
- **PERCENTAGE**: Discount is a percentage of the total amount (e.g., 20% off)
- **FIXED**: Discount is a fixed amount (e.g., 5000 RWF off)

### 4. **UI Components**

#### Promo Code Input (Order Summary - Left Side)
Located in lines 656-697:

**When no promo applied:**
- Input field with Tag icon
- "Apply" button
- Error message display (if validation fails)

**When promo applied:**
- Green success badge with CheckCircle icon
- Shows promo code and savings amount
- Remove button (X icon) to clear promo

#### Discount Display
- Shows in order summary (lines 644-653)
- Green text with Tag icon
- Format: "- Rwf {amount}"

#### Browse Available Promotions
- Section at bottom of page (lines 1084-1098)
- Uses `RestaurantAvailablePromos` component
- Shows all available public promos
- One-click apply functionality

### 5. **Promo Code Service**

Located in `src/app/services/promoService.ts`:

```typescript
validatePromo: async (code: string, data: { orderAmount: number }) => {
  const axiosClient = createAxiosClient();
  const response = await axiosClient.post(`/promo/validate/${code}`, data);
  return response.data;
}
```

**Validation Endpoint:** `POST /promo/validate/{code}`

**Request Body:**
```json
{
  "orderAmount": 5400
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Promo code is valid",
  "data": {
    "id": "...",
    "code": "TEST20",
    "name": "20% Off Test Promo",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "minOrderAmount": 1000,
    // ... other promo details
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Promo code has expired"
}
```

### 6. **Checkout Integration**

When user clicks "Checkout" button (lines 466-566):

1. Form validation runs
2. Checkout payload is constructed (lines 499-525)
3. **If promo applied**, it's added to payload:
   ```typescript
   if (appliedPromo) {
     checkoutPayload.promoCode = appliedPromo.code;
   }
   ```
4. Payload sent to `/checkouts` endpoint
5. Backend processes payment with discount applied

### 7. **Response Handling**

The backend response includes the applied discount:

```json
{
  "message": "Payment completed using wallet balance",
  "data": {
    "checkout": {
      "id": "ea34dbe9-d943-4321-b12f-d6d05cdfbbcc",
      "totalAmount": 5400,  // Final amount after discount
      "paymentStatus": "COMPLETED",
      // ... other checkout details
    }
  }
}
```

## User Flow

1. **User adds items to cart**
2. **Navigates to checkout page**
3. **Sees available promotions** at bottom of page
4. **Enters or selects promo code**
5. **Clicks "Apply"**
6. **System validates promo code**:
   - ✅ Valid: Discount applied, shown in summary
   - ❌ Invalid: Error message displayed
7. **User reviews final total** (with discount)
8. **Completes checkout**
9. **Backend applies discount** and processes payment

## Key Features

✅ **Real-time validation** before checkout  
✅ **Visual feedback** with success/error states  
✅ **Discount preview** in order summary  
✅ **Browse available promos** section  
✅ **One-click apply** from promo list  
✅ **Remove promo** functionality  
✅ **Supports percentage and fixed discounts**  
✅ **Server-side re-validation** for security  

## Error Handling

Common validation errors:
- "Invalid promo code"
- "Promo code has expired"
- "Minimum order amount not met"
- "This promo is not available for your restaurant"
- "Promo usage limit exceeded"
- "Failed to validate promo code" (network error)

## Testing

To test the promo code feature:

1. **Create a promo code** in the admin dashboard
2. **Set appropriate parameters**:
   - Discount type (PERCENTAGE or FIXED)
   - Discount value
   - Minimum order amount
   - Expiry date
   - Active status
3. **Add items to cart** (ensure total meets minimum)
4. **Go to checkout**
5. **Enter promo code** and click Apply
6. **Verify discount** is calculated correctly
7. **Complete checkout**
8. **Check order details** in response

## Files Modified

- ✅ `src/app/services/checkoutService.ts` - Added `promoCode` field to `CheckoutRequest`
- ✅ `src/app/(private)/restaurant/checkout/_components/delivery-form.tsx` - Full promo UI and logic
- ✅ `src/app/services/promoService.ts` - Validation service

## API Endpoints Used

1. **`POST /promo/validate/{code}`** - Validate promo code
2. **`POST /checkouts`** - Create checkout with promo code

## Notes

- Promo codes are **case-insensitive** (automatically converted to uppercase)
- Validation happens **twice**: once on apply, once on checkout submission
- Discount is applied **after** other fees (delivery, packaging)
- Final total **cannot be negative** (Math.max ensures minimum 0)
- Applied promo is **stored in component state** until checkout completes
