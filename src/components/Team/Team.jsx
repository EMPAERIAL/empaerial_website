'use client';
import styles from "./Team.module.css";
import useTeams from "@/hooks/useTeams";

export default function Team({ t }) {
  const { teams } = useTeams();

  return (
    <section className={styles.teamSection} aria-labelledby="team-title">
      <div className={`${styles.teamHeader} reveal`}>
        <h2 id="team-title" className={styles.teamTitle}>
          {t.team_title}
        </h2>
        <p className={styles.teamSubtitle}>{t.team_subtitle}</p>
      </div>

      <div className={`${styles.carouselWrapper} reveal`}>
        <div className={styles.cardContainer}>
          {teams.map((group, index) => (
            <article key={index} className={styles.bigCard}>
              <div className={styles.cardInner}>

                {/* FRONT SIDE */}
                <div className={styles.cardFront}>
                  <h3 className={styles.cardTitle}>{group.title}</h3>

                  <p className={styles.cardDescription}>
                    {Array.isArray(group.description)
                      ? group.description.join(" ")
                      : group.description}
                  </p>
                </div>

                {/* BACK SIDE */}
                <div className={styles.cardBack}>
                  <h3>{t.team_members}</h3>

                  <ul className={styles.membersList}>
                    {group.members.map((member, i) => (
                      <li key={i} className={styles.memberItem}>
                        <a
                          href={member.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.memberLink}
                        >
                          {member.name}
                        </a>

                        <div className={styles.memberTooltip}>
  {member.photo ? (
    <img
      src={member.photo}
      alt={`${member.name}, ${member.role}`}
      className={styles.memberPhoto}
    />
  ) : (
    <div className={styles.memberPhotoPlaceholder}>
      No Photo
    </div>
  )}


                          <div className={styles.tooltipContent}>
                            {member.age && (
                              <p>
                                <strong>{t.team_age}:</strong> {member.age}
                              </p>
                            )}

                            {member.country && (
                              <p>
                                <strong>{t.team_country}:</strong> {member.country}
                              </p>
                            )}

                            {member.role && (
                              <p>
                                <strong>{t.team_role}:</strong> {member.role}
                              </p>
                            )}

                            {member.skills && (
                              <p>
                                <strong>{t.team_skills}:</strong>{" "}
                                {member.skills}
                              </p>
                            )}

                            {member.funFact && (
                              <p>
                                <strong>{t.team_funfact}:</strong> "{member.funFact}"
                              </p>
                            )}
                          </div>
                        </div>

                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
