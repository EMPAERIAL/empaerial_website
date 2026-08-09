'use client';
import { useCallback, useState } from 'react';
import styles from './Team.module.css';
import useTeams from '@/hooks/useTeams';

const TAB_MAP = {
  software:     { label: 'SOFTWARE',     descKey: 'team_software_desc' },
  electronics:  { label: 'ELECTRONICS',  descKey: 'team_electronics_desc' },
  mechanical:   { label: 'MECHANICAL',   descKey: 'team_mechanical_desc' },
  coordinators: { label: 'COORDINATORS', descKey: 'team_coord_desc' },
};

function getKey(title = '') {
  const s = title.toLowerCase();
  if (s.includes('software'))   return 'software';
  if (s.includes('electron'))   return 'electronics';
  if (s.includes('mechanic'))   return 'mechanical';
  if (s.includes('coord'))      return 'coordinators';
  return 'software';
}

export default function Team({ t }) {
  const { teams, loading, error } = useTeams();
  const [activeKey, setActiveKey] = useState('software');
  // Cards in the first grid row have no room for a tooltip above them, so it
  // would sit on top of the tabs and the section copy. Flip those below.
  const [flippedCard, setFlippedCard] = useState(null);

  const activeGroup = teams.find((g) => getKey(g.title) === activeKey);
  const members = activeGroup?.members ?? [];

  const positionTooltip = useCallback((index) => (event) => {
    const card = event.currentTarget;
    const tooltip = card.querySelector(`.${styles.tooltip}`);
    const grid = card.parentElement;
    if (!tooltip || !grid) return;

    // Flip when the tooltip would rise past the top of the grid — that is the
    // first row, where it would otherwise cover the tabs and the section copy.
    const projectedTop = card.getBoundingClientRect().top - 12 - tooltip.offsetHeight;
    setFlippedCard(projectedTop < grid.getBoundingClientRect().top ? index : null);
  }, []);

  return (
    <section className="sec sec-light" id="team" aria-labelledby="team-title">
      <div className="sec-inner">
        {/* Section header */}
        <div className="sec-head reveal">
          <p className="sec-eyebrow">TEAM</p>
          <div className={styles.titleRow}>
            <h2 id="team-title" className={`sec-h2 ${styles.headTitle}`}>{t.team_title}</h2>
            <a href="/apply" className={styles.apply} title={t.apply_cta_note}>
              {t.apply_cta || 'APPLY'} →
            </a>
          </div>
          <p className="sec-sub">{t.team_subtitle}</p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Team departments">
          {Object.entries(TAB_MAP).map(([key, { label }]) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeKey === key}
              className={`${styles.tab} ${activeKey === key ? styles.tabActive : ''}`}
              data-label={label}
              onClick={() => setActiveKey(key)}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab description */}
        <p className={styles.tabDesc}>
          {t[TAB_MAP[activeKey].descKey]}
        </p>

        {/* Member grid */}
        {loading ? (
          <p className={styles.loading}>{t.team_loading || 'Loading…'}</p>
        ) : error ? (
          <p className={styles.status} role="status">
            {t.team_error || 'We could not load the roster right now. Please try again shortly.'}
          </p>
        ) : members.length === 0 ? (
          <p className={styles.status} role="status">
            {t.team_empty || 'No members listed for this department yet.'}
          </p>
        ) : (
          <div className={`${styles.grid} reveal`} role="tabpanel" aria-live="polite">
            {members.map((member, i) => (
              <div
                key={i}
                className={`${styles.card} ${flippedCard === i ? styles.cardFlipped : ''}`}
                onMouseEnter={positionTooltip(i)}
                onFocus={positionTooltip(i)}
              >
                <div className={styles.photoWrap}>
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className={styles.photo}
                    />
                  ) : (
                    <div className={styles.photoPlaceholder} aria-hidden="true" />
                  )}
                </div>
                <div className={styles.info}>
                  <p className={styles.name}>{member.name}</p>
                  <p className={styles.role}>{member.role}</p>
                </div>

                {/* Hover tooltip */}
                <div className={styles.tooltip} role="tooltip">
                  <p className={styles.tooltipName}>{member.name}</p>
                  {member.role && (
                    <p className={styles.tooltipRow}>
                      <span>{t.team_role}</span>
                      {member.role}
                    </p>
                  )}
                  {member.skills && (
                    <p className={styles.tooltipRow}>
                      <span>{t.team_skills}</span>
                      {member.skills}
                    </p>
                  )}
                  {member.funFact && (
                    <p className={styles.tooltipRow}>
                      <span>{t.team_funfact}</span>
                      &ldquo;{member.funFact}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
