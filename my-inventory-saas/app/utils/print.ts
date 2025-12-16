export const printHtml = (htmlContent: string) => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Mobile browsers often block iframe print dialogs. Use a new tab fallback there.
  if (isMobile) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    // Give the new window a tick to render before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Close after print to avoid leaving blank tabs
      printWindow.close();
    }, 300);
    return;
  }

  // Desktop path: use hidden iframe for cleaner print rendering
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.border = 'none';
  
  document.body.appendChild(iframe);
  
  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();
    
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Printing failed:', err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    };
  }
};
