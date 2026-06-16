import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import './BarcodeLabel.css';

export default function BarcodeLabel({ product, onClose }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && product?.barcodeId) {
      JsBarcode(barcodeRef.current, product.barcodeId, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 12,
        font: 'Inter',
        margin: 8,
        background: '#ffffff',
        lineColor: '#000000',
      });
    }
  }, [product?.barcodeId]);

  const handlePrint = () => {
    window.print();
  };

  if (!product) return null;

  return (
    <div className="barcode-modal-overlay" onClick={onClose}>
      <div className="barcode-modal" onClick={(e) => e.stopPropagation()}>
        <button className="barcode-modal__close" onClick={onClose}>×</button>

        <h3 className="barcode-modal__title">Barcode Label Preview</h3>

        <div className="barcode-print-area">
          <div className="barcode-label">
            <div className="barcode-label__brand">EL BRO SYNDICATE</div>
            <div className="barcode-label__divider"></div>
            <div className="barcode-label__product-name">{product.name}</div>
            <div className="barcode-label__price">₹{product.price?.toLocaleString()}</div>
            <div className="barcode-label__sku">SKU: {product.sku}</div>
            <svg ref={barcodeRef} className="barcode-label__barcode"></svg>
          </div>
        </div>

        <div className="barcode-modal__actions">
          <button className="btn-luxury" onClick={handlePrint}>
            Print Label
          </button>
          <button className="btn-luxury" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
