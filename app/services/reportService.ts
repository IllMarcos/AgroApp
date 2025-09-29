// En: app/services/reportService.ts

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { child, get, getDatabase, onValue, push, query, ref, serverTimestamp, set } from "firebase/database";
import { Alert } from "react-native";


// --- CONFIGURACIÓN DE CLOUDINARY (¡REEMPLAZA CON TUS CLAVES!) ---
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dculhg48d/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "AgroApp";
// --- LOGO EN BASE64 PARA EL PDF ---
const logoDataUri = 'data:image/webp;base64,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';

function sanitizeKey(key: string): string {
  return key.replace(/[.#$/\[\]]/g, '_');
}

async function uploadImages(localImageUris: string[]): Promise<string[]> {
  if (!CLOUDINARY_URL || CLOUDINARY_URL.includes('TU_CLOUD_NAME')) {
    Alert.alert('Configuración Requerida', 'Por favor, añade tus credenciales de Cloudinary en app/services/reportService.ts');
    return [];
  }
  const imageUrls: string[] = [];
  for (const uri of localImageUris) {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = await response.json();
      if (data.secure_url) {
        imageUrls.push(data.secure_url);
      }
    } catch (err) {
      console.error("Error subiendo a Cloudinary:", err);
      throw new Error('No se pudo subir una de las imágenes.');
    }
  }
  return imageUrls;
}

export async function createReport(reportData: any, localImageUris: string[] = []) {
  try {
    const imageUrls = await uploadImages(localImageUris);

    const sanitizedPlagas: { [key: string]: any } = {};
    for (const key in reportData.plagas) {
      sanitizedPlagas[sanitizeKey(key)] = reportData.plagas[key];
    }

    const sanitizedEnfermedades: { [key: string]: any } = {};
    for (const key in reportData.enfermedades) {
      sanitizedEnfermedades[sanitizeKey(key)] = reportData.enfermedades[key];
    }

    const payload = {
      ...reportData,
      plagas: sanitizedPlagas,
      enfermedades: sanitizedEnfermedades,
      images: imageUrls,
      createdAt: serverTimestamp()
    };

    const dbRef = ref(getDatabase(), 'reportes');
    const newReportRef = push(dbRef);
    await set(newReportRef, payload);

    return { id: newReportRef.key, imageUrls };
  } catch (err) {
    console.error("createReport error:", err);
    throw err;
  }
}

export async function generatePdf(reportData: any) {
  try {
    const plagasHtml = Object.entries(reportData.plagas)
      .filter(([, data]: any) => data.grado || data.estadoBiologico)
      .map(([plaga, data]: any) => `
        <tr>
          <td>${plaga.replace(/_/g, ' ')}</td>
          <td>${data.estadoBiologico || 'N/A'}</td>
          <td>${data.grado || 'N/A'}</td>
        </tr>
      `).join('');

    const enfermedadesHtml = Object.entries(reportData.enfermedades)
      .filter(([, data]: any) => data.grado)
      .map(([enfermedad, data]: any) => `
        <tr>
          <td>${enfermedad.replace(/_/g, ' ')}</td>
          <td>${data.grado}</td>
        </tr>
      `).join('');
      
    const imagenesHtml = (reportData.images || []).map((url: string) => `
      <img src="${url}" class="report-image" />
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #2e7d32; padding-bottom: 10px; position: relative; }
            .header img { width: 80px; height: 80px; position: absolute; top: 10px; left: 10px; }
            .header h1 { margin: 0; color: #2e7d32; font-size: 22px; padding-top: 10px;}
            .header h2 { margin: 5px 0 0; font-weight: normal; font-size: 16px; }
            .report-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .report-table th, .report-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .report-table th { background-color: #f2f2f2; }
            .section-title { font-size: 20px; color: #2e7d32; margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;}
            .report-image { max-width: 45%; margin: 5px; border-radius: 5px; display: inline-block; }
            .footer { text-align: center; border-top: 2px solid #2e7d32; padding-top: 10px; font-size: 12px; color: #777; margin-top: 40px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-item { break-inside: avoid; }
            .info-item b { display: block; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoDataUri}" alt="Logo" />
            <h1>Agrícola Bernal Produce</h1>
            <h2>Reporte de Inspección de Campo</h2>
          </div>

          <h3 class="section-title">Datos Generales</h3>
          <div class="info-grid">
              <div class="info-item"><b>Folio:</b> ${reportData.folio || 'N/A'}</div>
              <div class="info-item"><b>Fecha:</b> ${reportData.fecha}</div>
              <div class="info-item"><b>Cultivo:</b> ${reportData.cultivo}</div>
              <div class="info-item"><b>Superficie:</b> ${reportData.superficie || 'N/A'} ha</div>
              <div class="info-item"><b>Responsable:</b> ${reportData.responsable}</div>
              <div class="info-item"><b>Ubicación (Lat, Lng):</b> ${reportData.ubicacion ? `${reportData.ubicacion.lat.toFixed(5)}, ${reportData.ubicacion.lng.toFixed(5)}` : 'N/A'}</div>
          </div>
          
          ${plagasHtml ? `
          <h3 class="section-title">Plagas Detectadas</h3>
          <table class="report-table">
            <thead><tr><th>Plaga</th><th>Estado Biológico</th><th>Grado</th></tr></thead>
            <tbody>${plagasHtml}</tbody>
          </table>` : ''}

          ${enfermedadesHtml ? `
          <h3 class="section-title">Enfermedades Detectadas</h3>
          <table class="report-table">
            <thead><tr><th>Enfermedad</th><th>Grado</th></tr></thead>
            <tbody>${enfermedadesHtml}</tbody>
          </table>` : ''}

          <h3 class="section-title">Observaciones</h3>
          <p>${reportData.observaciones || 'Sin observaciones.'}</p>

          ${imagenesHtml ? `
          <h3 class="section-title">Evidencia Fotográfica</h3>
          <div>${imagenesHtml}</div>` : ''}

          <div class="footer">
            Generado por Monitoreo Agrícola App
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Compartir Reporte' });
  } catch (error) {
    console.error("Error generando el PDF:", error);
    Alert.alert("Error", "No se pudo generar el PDF. Por favor, inténtalo de nuevo.");
  }
}

export async function getReportById(reportId: string) {
  try {
    const dbRef = ref(getDatabase());
    const snapshot = await get(child(dbRef, `reportes/${reportId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error("No se encontró el reporte.");
    }
  } catch (error) {
    console.error("Error obteniendo el reporte:", error);
    throw error;
  }
}

export function getAllReports(callback: (reports: any[]) => void) {
  const dbRef = query(ref(getDatabase(), 'reportes'));

  const unsubscribe = onValue(dbRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convertir el objeto de reportes en un array
      const reportList = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => b.createdAt - a.createdAt); // Ordenar por fecha de creación
      callback(reportList);
    } else {
      callback([]);
    }
  });

  return unsubscribe; // Devuelve la función para desuscribirse y evitar memory leaks
}