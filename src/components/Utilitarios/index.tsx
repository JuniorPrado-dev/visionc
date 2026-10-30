import { useState } from 'react';
import styles from './MainPage.module.css';
import BASE_URL from '../../constants/url';

type UtilTab = 'Visualização' | 'Conversão';

export default function UtilitiesTab() {
  const [activeUtilTab, setActiveUtilTab] = useState<UtilTab>('Visualização');
  const [visImageFile, setVisImageFile] = useState<File | null>(null);
  const [visTxtFile, setVisTxtFile] = useState<File | null>(null);
  const [visResultUrl, setVisResultUrl] = useState<string | null>(null);
  const [convJsonFile, setConvJsonFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUtilTabChange = (tab: UtilTab) => {
    setActiveUtilTab(tab);
    setVisImageFile(null);
    setVisTxtFile(null);
    setVisResultUrl(null);
    setConvJsonFile(null);
    setError(null);
  };

  const handleVisualizeUtil = async () => {
    if (!visImageFile || !visTxtFile) return;
    setIsLoading(true);
    setError(null);
    setVisResultUrl(null);

    try {
      const formData = new FormData();
      formData.append('image', visImageFile);
      formData.append('labels', visTxtFile);

      const response = await fetch(`${BASE_URL}/visualization/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Erro ao gerar visualização.');
      }

      const blob = await response.blob();
      setVisResultUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err.message || 'Falha de conexão com a API de visualização.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertUtil = async () => {
    if (!convJsonFile) return;
    setIsLoading(true);
    setError(null);

    try {
      const fileText = await convJsonFile.text();
      const jsonPayload = JSON.parse(fileText);

      const response = await fetch(`http://${BASE_URL}/conversion/coco-to-yolo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonPayload),
      });

      if (!response.ok) throw new Error('Erro na conversão. Verifique o formato do JSON.');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_yolo.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Erro ao ler arquivo ou conectar com a API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Utilitários</h2>
      
      <div className={styles.subMenu}>
        <button 
          onClick={() => handleUtilTabChange('Visualização')} 
          className={activeUtilTab === 'Visualização' ? styles.subBtnActive : styles.subBtn}
        >
          Visualização
        </button>
        <button 
          onClick={() => handleUtilTabChange('Conversão')} 
          className={activeUtilTab === 'Conversão' ? styles.subBtnActive : styles.subBtn}
        >
          Conversão
        </button>
      </div>

      {activeUtilTab === 'Visualização' && (
        <div className={styles.utilSection}>
          <p className={styles.instructions}>Upload da imagem e arquivo YOLO (.txt) para ver as caixas.</p>
          <div className={styles.uploadGroup}>
            <label htmlFor="visImage" className={styles.uploadButton}>
              {visImageFile ? visImageFile.name : '1. Escolher Imagem'}
            </label>
            <input id="visImage" type="file" accept="image/*" onChange={(e) => setVisImageFile(e.target.files?.[0] || null)} className={styles.fileInput} />

            <label htmlFor="visTxt" className={styles.uploadButton}>
              {visTxtFile ? visTxtFile.name : '2. Escolher Rótulos (.txt)'}
            </label>
            <input id="visTxt" type="file" accept=".txt" onChange={(e) => setVisTxtFile(e.target.files?.[0] || null)} className={styles.fileInput} />
          </div>
          
          <button onClick={handleVisualizeUtil} disabled={!visImageFile || !visTxtFile || isLoading} className={styles.actionButton} style={{marginTop: '1rem'}}>
            {isLoading ? 'Processando...' : 'Visualizar Bounding Boxes'}
          </button>
          {error && <p className={styles.errorText}>{error}</p>}
          {visResultUrl && (
            <div className={styles.previewContainer}>
              <img src={visResultUrl} alt="Visualização" className={styles.imagePreview} />
            </div>
          )}
        </div>
      )}

      {activeUtilTab === 'Conversão' && (
        <div className={styles.utilSection}>
           <p className={styles.instructions}>Upload de anotações COCO (.json) para obter um ZIP YOLO.</p>
           <div className={styles.uploadGroup}>
            <label htmlFor="convJson" className={styles.uploadButton}>
              {convJsonFile ? convJsonFile.name : 'Escolher JSON COCO'}
            </label>
            <input id="convJson" type="file" accept=".json, application/json" onChange={(e) => setConvJsonFile(e.target.files?.[0] || null)} className={styles.fileInput} />
           </div>

           <button onClick={handleConvertUtil} disabled={!convJsonFile || isLoading} className={styles.actionButton} style={{marginTop: '1rem'}}>
            {isLoading ? 'Convertendo...' : 'Converter e Baixar ZIP'}
          </button>
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
      )}
    </section>
  );
}