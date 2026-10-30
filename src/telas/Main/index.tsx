import { useState } from 'react';
import styles from './MainPage.module.css';
import ClassificationTab from '../../components/Classificacao';
import DetectionTab from '../../components//Deteccao';
import UtilitiesTab from '../../components/Utilitarios';

type Tab = 'Classificação' | 'Detecção' | 'Utilitários';

export default function MainPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Classificação');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          {(['Classificação', 'Detecção', 'Utilitários'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.navButton} ${activeTab === tab ? styles.active : ''}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className={styles.mainContent}>
        {activeTab === 'Classificação' && <ClassificationTab />}
        {activeTab === 'Detecção' && <DetectionTab />}
        {activeTab === 'Utilitários' && <UtilitiesTab />}
      </main>
    </div>
  );
}