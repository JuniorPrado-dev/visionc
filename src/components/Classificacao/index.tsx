import{ useState, type ChangeEvent } from 'react';
import styles from './MainPage.module.css';
import BASE_URL from '../../constants/url';

export default function ClassificationTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  };

  const handleClassify = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${BASE_URL}/classification/cifar-10`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erro ao processar a imagem na API.');

      const data = await response.json();
      console.log(data)
      setPrediction(data.predicao.nome_classe||"Não Classificado");
    } catch (err: any) {
      setError(err.message || 'Falha na conexão com a API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Classificação (CIFAR-10)</h2>
      <div className={styles.uploadArea}>
        <label htmlFor="fileUploadClass" className={styles.uploadButton}>
          {selectedFile ? selectedFile.name : 'Escolher Imagem'}
        </label>
        <input id="fileUploadClass" type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
      </div>
      {previewUrl && (
        <div className={styles.previewContainer}>
          <img src={previewUrl} alt="Preview Original" className={styles.imagePreview} />
          <button onClick={handleClassify} disabled={isLoading} className={styles.actionButton}>
            {isLoading ? 'Processando...' : 'Enviar para Classificação'}
          </button>
        </div>
      )}
      {error && <p className={styles.errorText}>{error}</p>}
      {prediction && (
        <div className={styles.resultArea}>
          <h3>Resultado:</h3>
          <p className={styles.predictionText}>{prediction}</p>
        </div>
      )}
    </section>
  );
}