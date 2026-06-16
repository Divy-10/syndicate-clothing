import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

// Global SweetAlert2 override for window.alert
window.alert = (message) => {
  let icon = 'info';
  let cleanMessage = message;

  if (message.includes('✅')) {
    icon = 'success';
    cleanMessage = message.replace('✅', '').trim();
  } else if (message.includes('❌')) {
    icon = 'error';
    cleanMessage = message.replace('❌', '').trim();
  } else if (message.toLowerCase().includes('success') || message.toLowerCase().includes('successfully')) {
    icon = 'success';
  } else if (message.toLowerCase().includes('error') || message.toLowerCase().includes('fail') || message.toLowerCase().includes('failed')) {
    icon = 'error';
  }

  Swal.fire({
    text: cleanMessage,
    icon: icon,
    background: '#0a0a0a',
    color: '#E1DCC9',
    confirmButtonColor: '#B8B1A1',
    customClass: {
      popup: 'luxury-alert-popup',
      confirmButton: 'luxury-alert-btn'
    }
  });
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
