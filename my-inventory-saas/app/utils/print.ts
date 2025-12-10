export const printHtml = (htmlContent: string) => {
  // Create a hidden iframe
  const iframe = document.createElement('iframe');
  // Use absolute positioning off-screen instead of 0x0 size to ensure browser renders it
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
        // Focus is required for some browsers (IE/Edge) before printing
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Printing failed:', err);
      } finally {
        // Remove the iframe after a short delay
        // The print dialog blocks execution in many browsers, so this runs after the dialog closes
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    };
  }
};
