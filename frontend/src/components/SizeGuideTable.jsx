import { useState } from 'react';
import './SizeGuideTable.css';

export default function SizeGuideTable() {
  const [activeTab, setActiveTab] = useState('tops'); // 'tops' | 'bottoms'
  const [unit, setUnit] = useState('inches'); // 'inches' | 'cms'

  const topsData = {
    inches: [
      { size: 'S', chest: '36" - 38"', waist: '30" - 32"', shoulder: '17.5"', length: '27.5"' },
      { size: 'M', chest: '38" - 40"', waist: '32" - 34"', shoulder: '18.0"', length: '28.5"' },
      { size: 'L', chest: '40" - 42"', waist: '34" - 36"', shoulder: '18.5"', length: '29.5"' },
      { size: 'XL', chest: '42" - 44"', waist: '36" - 38"', shoulder: '19.0"', length: '30.5"' },
      { size: 'XXL', chest: '44" - 46"', waist: '38" - 40"', shoulder: '20.0"', length: '31.5"' }
    ],
    cms: [
      { size: 'S', chest: '91 - 96 cm', waist: '76 - 81 cm', shoulder: '44 cm', length: '70 cm' },
      { size: 'M', chest: '96 - 101 cm', waist: '81 - 86 cm', shoulder: '46 cm', length: '72 cm' },
      { size: 'L', chest: '101 - 106 cm', waist: '86 - 91 cm', shoulder: '47 cm', length: '75 cm' },
      { size: 'XL', chest: '106 - 111 cm', waist: '91 - 96 cm', shoulder: '48 cm', length: '77 cm' },
      { size: 'XXL', chest: '111 - 117 cm', waist: '96 - 101 cm', shoulder: '50 cm', length: '80 cm' }
    ]
  };

  const bottomsData = {
    inches: [
      { size: 'S (30)', waist: '30"', hip: '38"', inseam: '30"', length: '40"' },
      { size: 'M (32)', waist: '32"', hip: '40"', inseam: '30.5"', length: '41"' },
      { size: 'L (34)', waist: '34"', hip: '42"', inseam: '31"', length: '42"' },
      { size: 'XL (36)', waist: '36"', hip: '44"', inseam: '31.5"', length: '43"' },
      { size: 'XXL (38)', waist: '38"', hip: '46"', inseam: '32"', length: '44"' }
    ],
    cms: [
      { size: 'S (30)', waist: '76 cm', hip: '96 cm', inseam: '76 cm', length: '101 cm' },
      { size: 'M (32)', waist: '81 cm', hip: '101 cm', inseam: '77 cm', length: '104 cm' },
      { size: 'L (34)', waist: '86 cm', hip: '106 cm', inseam: '79 cm', length: '106 cm' },
      { size: 'XL (36)', waist: '91 cm', hip: '111 cm', inseam: '80 cm', length: '109 cm' },
      { size: 'XXL (38)', waist: '96 cm', hip: '117 cm', inseam: '81 cm', length: '111 cm' }
    ]
  };

  const activeData = activeTab === 'tops' ? topsData[unit] : bottomsData[unit];

  return (
    <div className="size-guide-table-container">
      {/* Controls: Category Tabs and Unit Toggle */}
      <div className="size-guide-controls">
        <div className="category-tabs">
          <button
            className={`tab-btn ${activeTab === 'tops' ? 'active' : ''}`}
            onClick={() => setActiveTab('tops')}
          >
            TOPS & OUTERWEAR
          </button>
          <button
            className={`tab-btn ${activeTab === 'bottoms' ? 'active' : ''}`}
            onClick={() => setActiveTab('bottoms')}
          >
            BOTTOMS & CARGOS
          </button>
        </div>

        <div className="unit-toggle">
          <button
            className={`unit-btn ${unit === 'inches' ? 'active' : ''}`}
            onClick={() => setUnit('inches')}
          >
            INCHES
          </button>
          <button
            className={`unit-btn ${unit === 'cms' ? 'active' : ''}`}
            onClick={() => setUnit('cms')}
          >
            CM
          </button>
        </div>
      </div>

      {/* Sizing Table */}
      <div className="table-wrapper">
        <table className="luxury-size-table">
          <thead>
            {activeTab === 'tops' ? (
              <tr>
                <th>SIZE</th>
                <th>CHEST</th>
                <th>WAIST</th>
                <th>SHOULDER</th>
                <th>LENGTH</th>
              </tr>
            ) : (
              <tr>
                <th>SIZE</th>
                <th>WAIST</th>
                <th>HIP</th>
                <th>INSEAM</th>
                <th>LENGTH</th>
              </tr>
            )}
          </thead>
          <tbody>
            {activeData.map((row) => (
              <tr key={row.size}>
                <td className="size-label">{row.size}</td>
                {activeTab === 'tops' ? (
                  <>
                    <td>{row.chest}</td>
                    <td>{row.waist}</td>
                    <td>{row.shoulder}</td>
                    <td>{row.length}</td>
                  </>
                ) : (
                  <>
                    <td>{row.waist}</td>
                    <td>{row.hip}</td>
                    <td>{row.inseam}</td>
                    <td>{row.length}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="size-guide-note">
        <p>* Measurements listed are body measurements, not garment measurements. If you are between sizes, we recommend ordering a size up for a more relaxed, oversized streetwear fit.</p>
      </div>
    </div>
  );
}
