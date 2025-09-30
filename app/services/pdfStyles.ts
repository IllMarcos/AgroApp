// En: app/services/pdfStyles.ts

import Colors from '@/constants/Colors';

export const getPdfStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
  body { 
    font-family: 'Roboto', sans-serif; 
    color: ${Colors.light.text};
    margin: 40px;
  }
  .header {
    display: flex;
    align-items: center;
    border-bottom: 2px solid ${Colors.light.tint};
    padding-bottom: 15px;
  }
  .header img {
    width: 60px;
    height: 60px;
    margin-right: 15px;
  }
  .header-text h1 {
    margin: 0;
    color: ${Colors.light.tint};
    font-size: 24px;
    font-weight: 700;
  }
  .header-text h2 {
    margin: 0;
    font-weight: 400;
    font-size: 16px;
    color: ${Colors.light.info};
  }
  .section-title {
    font-size: 20px;
    font-weight: 700;
    color: ${Colors.light.tint};
    margin-top: 30px;
    margin-bottom: 15px;
    border-bottom: 1px solid ${Colors.light.subtle};
    padding-bottom: 5px;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 20px;
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
  }
  .info-item { font-size: 14px; }
  .info-item b {
    color: ${Colors.light.text};
    display: block;
    margin-bottom: 2px;
  }
  .report-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  .report-table th, .report-table td {
    border: 1px solid ${Colors.light.subtle};
    padding: 10px;
    text-align: left;
    font-size: 14px;
  }
  .report-table th {
    background-color: ${Colors.light.accent};
    font-weight: 700;
  }
  .observations {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
  }
  .gallery {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
  }
  .image-container {
    border: 1px solid ${Colors.light.subtle};
    border-radius: 8px;
    overflow: hidden;
    height: 200px; /* <-- ALTURA FIJA PARA EL CONTENEDOR */
  }
  .report-image {
    width: 100%;
    height: 100%; /* <-- IMAGEN LLENA EL CONTENEDOR */
    object-fit: cover; /* <-- LA MAGIA ESTÁ AQUÍ: RECORTA EN LUGAR DE DEFORMAR */
  }
  .footer {
    text-align: center;
    border-top: 1px solid ${Colors.light.subtle};
    padding-top: 15px;
    font-size: 12px;
    color: ${Colors.light.subtle};
    margin-top: 40px;
  }
`;