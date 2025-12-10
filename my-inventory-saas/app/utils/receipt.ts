
export type ReceiptItem = {
  name: string;
  quantity: number;
  price: number;
};

export type StoreSettings = {
  name: string;
  address: string;
  phone: string;
  currency: string;
  taxRate: number;
};

export const generateReceipt = (
  items: ReceiptItem[],
  subtotal: number,
  tax: number,
  total: number,
  store: StoreSettings,
  date: string = new Date().toLocaleString(),
  paymentMethod: string = 'Cash'
) => {
  return `
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; background: #fff; color: #000; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
          .store-name { font-size: 24px; font-weight: 900; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px; }
          .receipt-title { font-size: 16px; font-weight: bold; margin: 10px 0; text-transform: uppercase; border: 1px solid #000; display: inline-block; padding: 2px 10px; }
          .store-info { font-size: 12px; margin: 2px 0; }
          .meta { margin-bottom: 15px; font-size: 11px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
          .item-name { flex: 1; padding-right: 10px; }
          .totals { margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px; }
          .total-row { display: flex; justify-content: space-between; font-size: 12px; margin-top: 3px; }
          .grand-total { font-size: 16px; font-weight: bold; margin-top: 10px; border-top: 2px solid #000; padding-top: 5px; }
          .footer { text-align: center; margin-top: 30px; font-size: 10px; font-style: italic; }
          .branding { margin-top: 15px; font-size: 8px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="store-name">${store.name}</h1>
          <div class="receipt-title">Receipt</div>
          <p class="store-info">${store.address}</p>
          <p class="store-info">${store.phone}</p>
        </div>
        
        <div class="meta">
          <p>Date: ${date}</p>
          <p>Payment: ${paymentMethod}</p>
        </div>

        <div class="items">
          ${items.map(item => `
            <div class="item">
              <span class="item-name">${item.name} x${item.quantity}</span>
              <span>${store.currency}${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${store.currency}${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (${store.taxRate}%)</span>
            <span>${store.currency}${tax.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>TOTAL</span>
            <span>${store.currency}${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for shopping with us!</p>
          <p>Please come again.</p>
          <div class="branding">
            Powered by StockFlow
          </div>
        </div>
      </body>
    </html>
  `;
};

export const generateWhatsAppText = (
  items: ReceiptItem[],
  subtotal: number,
  tax: number,
  total: number,
  store: StoreSettings,
  date: string = new Date().toLocaleString(),
  paymentMethod: string = 'Cash'
) => {
  let text = `*${store.name}*\n`;
  text += `Receipt\n`;
  if (store.address) text += `${store.address}\n`;
  if (store.phone) text += `${store.phone}\n`;
  text += `\nDate: ${date}\n`;
  text += `Payment: ${paymentMethod}\n`;
  text += `------------------------\n`;
  
  items.forEach(item => {
    text += `${item.name} x${item.quantity} - ${store.currency}${(item.price * item.quantity).toFixed(2)}\n`;
  });
  
  text += `------------------------\n`;
  text += `Subtotal: ${store.currency}${subtotal.toFixed(2)}\n`;
  text += `Tax (${store.taxRate}%): ${store.currency}${tax.toFixed(2)}\n`;
  text += `*TOTAL: ${store.currency}${total.toFixed(2)}*\n`;
  text += `------------------------\n`;
  text += `Thank you for shopping with us!\n`;
  text += `_Powered by StockFlow_`;
  
  return encodeURIComponent(text);
};
