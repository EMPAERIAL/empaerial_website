'use client';
import { useState } from 'react';
import styles from './Team.module.css';
import useTeams from '@/hooks/useTeams';
import WingCut from '../WingCut/WingCut';

const TAB_MAP = {
  software:     { label: 'SOFTWARE',     descKey: 'team_software_desc' },
  electronics:  { label: 'ELECTRONICS',  descKey: 'team_electronics_desc' },
  mechanical:   { label: 'MECHANICAL',   descKey: 'team_mechanical_desc' },
  coordinators: { label: 'COORDINATORS', descKey: 'team_coord_desc' },
};

function formatMemberName(key = "") {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function getKey(title = '') {
  const s = title.toLowerCase();
  if (s.includes('software'))   return 'software';
  if (s.includes('electron'))   return 'electronics';
  if (s.includes('mechanic'))   return 'mechanical';
  if (s.includes('coord'))      return 'coordinators';
  return 'software';
}

export default function Team({ t }) {
  const { teams, loading } = useTeams();
  const [activeKey, setActiveKey] = useState('software');

  const fallbackTeams = Object.entries(t?.members || {}).reduce(
    (acc, [key, member]) => {
      const role = member?.role || "";
      let groupKey = "software";
      const roleLower = role.toLowerCase();
      if (roleLower.includes("electron") || roleLower.includes("elektron")) groupKey = "electronics";
      else if (roleLower.includes("mechanic") || roleLower.includes("mekanik")) groupKey = "mechanical";
      else if (roleLower.includes("coord") || roleLower.includes("koordin")) groupKey = "coordinators";

      acc[groupKey].members.push({
        name: formatMemberName(key),
        role: member?.role || "",
        skills: member?.skills || "",
        funFact: member?.funfact || "",
        photo: "",
      });
      return acc;
    },
    {
      software: { title: "Software", members: [] },
      electronics: { title: "Electronics", members: [] },
      mechanical: { title: "Mechanical", members: [] },
      coordinators: { title: "Coordinators", members: [] },
    }
  );

  const effectiveTeams = Array.isArray(teams) && teams.length > 0
    ? teams
    : Object.values(fallbackTeams);
  const activeGroup = effectiveTeams.find((g) => getKey(g.title) === activeKey);

  return (
    <section className="sec sec-light" id="team" aria-labelledby="team-title">
      <div className="sec-inner">
        {/* Section header */}
        <div className="sec-head reveal">
          <p className="sec-eyebrow">TEAM</p>
          <h2 id="team-title" className="sec-h2">{t.team_title}</h2>
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
              onClick={() => setActiveKey(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab description */}
        <p className={styles.tabDesc}>
          {t[TAB_MAP[activeKey].descKey]}
        </p>

        {/* Member grid */}
        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : (
          <div className={`${styles.grid} reveal`} role="tabpanel" aria-live="polite">
            {(activeGroup?.members ?? []).map((member, i) => (
              <div key={i} className={styles.card}>
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

      <WingCut fill="#fff" bgColor="#000" />
    </section>
  );
}
