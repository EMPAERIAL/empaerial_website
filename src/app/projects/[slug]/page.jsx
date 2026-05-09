'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header/Header';
import styles from '@/app/DronePage.module.css';
import en from '@/translations/en.json';
import tr from '@/translations/tr.json';
import useProjects from '@/hooks/useProjects';

export default function ProjectDetails() {
  const { slug } = useParams();
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const userLang = navigator.language.startsWith('tr') ? 'tr' : 'en';
    setLang(userLang);
  }, []);

  const t = lang === 'tr' ? tr : en;

  const { projects, loading } = useProjects();
  const project = projects.find((p) => p.slug === slug);

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (!project) return <p style={{ padding: '2rem' }}>Project not found.</p>;

  return (
    <>
      <Header t={t} lang={lang} setLang={setLang} />
      <main className={styles.fullPage}>
        {}
        <div className={styles.imageContainer}>
          <div className={styles.imageGrid}>
            {Array.isArray(project.sections) &&
              project.sections
                .filter((s) => s.type === 'gallery')
                .flatMap((s) => s.data.images || [])
                .map((src, i) => (
                  <img key={i} src={src} alt={`${project.name} view ${i + 1}`} />
                ))}
          </div>
        </div>

        {}
        <div className={styles.detailsContainer}>
          <h1 className={styles.title}>{project.name}</h1>
          <p className={styles.subtitle}>
            {project.summary ||
              'A modular, lightweight quadcopter engineered for precision and endurance.'}
          </p>

          {}
          {project.sections
            ?.filter((s) => s.type === 'specs')
            .map((s, i) => (
              <div key={i} className={styles.detailsSection}>
                <h2>{t.vespasian?.specifications || 'Specifications'}</h2>
                <div className={styles.specGrid}>
                  {Array.isArray(s.data?.rows)
                    ? s.data.rows.map((item, idx) => (
                        <div key={idx}>
                          <strong>{item.key || '—'}:</strong> {item.value || 'N/A'}
                        </div>
                      ))
                    : Object.entries(s.data || {}).map(([key, val]) => (
                        <div key={key}>
                          <strong>{key.replaceAll('_', ' ')}:</strong> {val || 'N/A'}
                        </div>
                      ))}
                </div>
              </div>
            ))}

          {}
          {project.sections
            ?.filter((s) => s.type === 'materials')
            .map((s, i) => (
              <div key={i} className={styles.detailsSection}>
                <h2>{t.vespasian?.materials || 'Materials'}</h2>
                <div className={styles.bomTable}>
                  {Array.isArray(s.data?.rows)
                    ? s.data.rows.map((item, idx) => (
                        <div key={idx} className={styles.bomRow}>
                          <span>{item.key || '—'}</span>
                          <span>{item.value || 'N/A'}</span>
                        </div>
                      ))
                    : Object.entries(s.data || {}).map(([key, val]) => (
                        <div key={key} className={styles.bomRow}>
                          <span>{key}</span>
                          <span>{val}</span>
                        </div>
                      ))}
                </div>
              </div>
            ))}

          {}
          {project.sections
            ?.filter((s) => s.type === 'text')
            .map((s, i) => (
              <div key={i} className={styles.detailsSection}>
                <h2>{s.data.heading || 'About the Project'}</h2>
                <p>{s.data.content || 'Details coming soon.'}</p>
              </div>
            ))}

          {}
          {project.sections?.some((s) => s.type === 'contact') ? (
            project.sections
              .filter((s) => s.type === 'contact')
              .map((s, i) => (
                <div
                  key={i}
                  className={`${styles.detailsSection} ${styles.contactCard}`}
                >
                  <h2>
                    {lang === 'tr'
                      ? `${project.name} ile ilgileniyor musunuz?`
                      : `Interested in ${project.name}?`}
                  </h2>
                  <p>
                    {lang === 'tr'
                      ? 'İşbirlikleri, sponsorluklar veya sınırlı üretim mevcudiyeti için bizimle iletişime geçin.'
                      : 'For collaborations, sponsorships, or limited-batch availability, reach out to us.'}
                  </p>
                  <div className={styles.contactActions}>
                    <a
                      href={`mailto:${s.data?.email || 'empaerial.uav@gmail.com'}`}
                      className={styles.primaryBtn}
                    >
                      {lang === 'tr' ? 'E-posta Gönder' : 'Email Us'}
                    </a>
                    <a
                      href={s.data?.link || '/#contact'}
                      className={styles.secondaryBtn}
                    >
                      {lang === 'tr' ? 'İletişim Bölümü →' : 'Contact Section →'}
                    </a>
                  </div>
                </div>
              ))
          ) : (
            <div className={`${styles.detailsSection} ${styles.contactCard}`}>
              <h2>
                {lang === 'tr'
                  ? `${project.name} ile ilgileniyor musunuz?`
                  : `Interested in ${project.name}?`}
              </h2>
              <p>
                {lang === 'tr'
                  ? 'İşbirlikleri, sponsorluklar veya sınırlı üretim mevcudiyeti için bizimle iletişime geçin.'
                  : 'For collaborations, sponsorships, or limited-batch availability, reach out to us.'}
              </p>
              <div className={styles.contactActions}>
                <a
                  href="mailto:empaerial.uav@gmail.com"
                  className={styles.primaryBtn}
                >
                  {lang === 'tr' ? 'E-posta Gönder' : 'Email Us'}
                </a>
                <a href="/#contact" className={styles.secondaryBtn}>
                  {lang === 'tr' ? 'İletişim Bölümü →' : 'Contact Section →'}
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
