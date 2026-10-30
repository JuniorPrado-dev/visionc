import { useState, type ChangeEvent } from 'react';
import styles from './MainPage.module.css';
import BASE_URL from '../../constants/url';

type YoloVersion = 'v8' | 'v9' | 'v11';

export default function DetectionTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [yoloVersion, setYoloVersion] = useState<YoloVersion>('v8');
  const [detectionTxtContent, setDetectionTxtContent] = useState<string | null>(null);
  const [visualizedImageUrl, setVisualizedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionTxtContent(null);
      setVisualizedImageUrl(null);
      setError(null);
    }
  };

  const handleDetection = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setDetectionTxtContent(null);
    setVisualizedImageUrl(null);

    try {
      const formDataDetect = new FormData();
      formDataDetect.append('file', selectedFile);

      const resDetect = await fetch(`${BASE_URL}/detection/detect?version=${yoloVersion}`, {
        method: 'POST',
        body: formDataDetect,
      });

      if (!resDetect.ok) {
        const errDetail = await resDetect.json();
        throw new Error(errDetail.detail || 'Erro na detecção.');
      }

      const txtText = await resDetect.text();
      setDetectionTxtContent(txtText);

      const txtBlob = new Blob([txtText], { type: 'text/plain' });
      const formDataVis = new FormData();
      formDataVis.append('image', selectedFile);
      formDataVis.append('labels', txtBlob, 'labels.txt');

      const resVis = await fetch(`${BASE_URL}/visualization/`, {
        method: 'POST',
        body: formDataVis,
      });

      if (!resVis.ok) throw new Error('Erro ao gerar visualização automática.');

      const imgBlob = await resVis.blob();
      setVisualizedImageUrl(URL.createObjectURL(imgBlob));
    } catch (err: any) {
      setError(err.message || 'Falha na detecção ou visualização.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!detectionTxtContent || !selectedFile) return;
    const blob = new Blob([detectionTxtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
    a.download = `${baseName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Detecção (YOLO)</h2>
      <div className={styles.controlsRow}>
        <select value={yoloVersion} onChange={(e) => setYoloVersion(e.target.value as YoloVersion)} className={styles.selectInput}>
          <option value="v8">YOLOv8</option>
          <option value="v9">YOLOv9</option>
          <option value="v11">YOLOv11</option>
        </select>
        <label htmlFor="fileUploadDet" className={styles.uploadButton}>
          {selectedFile ? selectedFile.name : 'Escolher Imagem'}
        </label>
        <input id="fileUploadDet" type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
      </div>

      {previewUrl && !visualizedImageUrl && (
        <div className={styles.previewContainer}>
          <img src={previewUrl} alt="Preview Original" className={styles.imagePreview} />
          <button onClick={handleDetection} disabled={isLoading} className={styles.actionButton}>
            {isLoading ? 'Detectando...' : 'Realizar Detecção'}
          </button>
        </div>
      )}
      {error && <p className={styles.errorText}>{error}</p>}
      {visualizedImageUrl && (
        <div className={styles.previewContainer}>
          <h3 className={styles.subtitle}>Resultado da Detecção:</h3>
          <img src={visualizedImageUrl} alt="Imagem com Bounding Boxes" className={styles.imagePreview} />
          <div className={styles.buttonGroup}>
            <button onClick={handleDownloadTxt} className={styles.downloadButton}>Baixar Labels (.txt)</button>
            <button onClick={() => setVisualizedImageUrl(null)} className={styles.secondaryButton}>Detectar Novamente</button>
          </div>
        </div>
      )}
    </section>
  );
}