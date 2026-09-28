import { useTranslation } from '@/lib/i18n'
import { resumeConfig } from '@/data/resume-config'
import { assetUrl } from '@/lib/utils'
import { detectedAssets } from 'virtual:detected-assets'
import { SidebarSection } from './SidebarSection'
import { ContactItem } from './ContactItem'
import { ReferentItem } from './ReferentItem'
import { ProfilePhoto } from './ProfilePhoto'
import { SkillCategory } from './SkillCategory'
import { TechBadge } from './TechBadge'

export function Sidebar() {
  const { resolve } = useTranslation()
  const { personal, contact, skills, values, hobbies, referents, spokenLanguages, labels } = resumeConfig

  return (
    <div className="md:w-[29%] bg-gradient-to-b from-resume-sidebar-from to-resume-sidebar-to p-8">
      {/* Photo / Profile image — priority: config > auto-detected > emoji fallback */}
      {/* Hidden on mobile: shown next to the name in MainContent instead */}
      <ProfilePhoto
        photo={(personal.photo || detectedAssets.photo) ? assetUrl(personal.photo || detectedAssets.photo!) : undefined}
        name={personal.name}
        emoji={personal.photoBackEmoji}
        className="hidden md:flex justify-center mb-[1.1rem]"
      />

      {/* Subtitle — hidden on mobile: shown under the tagline in MainContent instead */}
      {personal.subtitle && (
        <p className="hidden md:block text-xs text-resume-text-secondary italic leading-relaxed text-justify mb-[1.2rem]">
          {resolve(personal.subtitle)}
        </p>
      )}

      {/* Contact — hidden on mobile: shown between the tagline and Experience in MainContent instead */}
      <SidebarSection title={resolve(labels.sections.contact)} className="hidden md:block">
        <div className="space-y-3">
          {contact.map((item) => (
            <ContactItem key={`${item.type}-${item.label}`} type={item.type} label={item.label} href={item.href} />
          ))}
        </div>
      </SidebarSection>

      {/* Referents — hidden on mobile: shown right under Contact in MainContent instead */}
      {referents?.length && labels.sections.referent ? (
        <SidebarSection title={resolve(labels.sections.referent)} className="hidden md:block">
          <div className="flex flex-col gap-2">
            {referents.map((referent) => (
              <ReferentItem
                key={referent.name}
                name={referent.name}
                title={resolve(referent.title)}
                href={referent.href}
              />
            ))}
          </div>
        </SidebarSection>
      ) : null}

      {/* Skills */}
      <SidebarSection title={resolve(labels.sections.skills)}>
        <div className="space-y-4">
          {skills.map((category, i) => (
            <SkillCategory key={`${resolve(category.title)}-${i}`} title={resolve(category.title)}>
              {category.type === 'badges' && (
                <div className="flex flex-wrap gap-1.5">
                  {category.items.map((item) => {
                    const techName = typeof item.name === 'string' ? item.name : Object.values(item.name)[0]
                    return <TechBadge key={techName} tech={techName} color={item.color} showIcon />
                  })}
                </div>
              )}
              {category.type === 'text' && (
                <p className="text-xs text-resume-text-secondary">
                  {category.items
                    .map((item) => (typeof item.name === 'string' ? item.name : resolve(item.name)))
                    .join(', ')}
                </p>
              )}
              {category.type === 'languages' && (
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  {category.items.map((item, j) => {
                    const name = typeof item.name === 'string' ? item.name : resolve(item.name)
                    return (
                      <span key={`${name}-${j}`} className="flex items-center gap-1">
                        <span className="text-resume-text-secondary">
                          {name} {item.level ? resolve(item.level) : ''}
                          {item.details && (
                            <span className="text-xs opacity-70 ml-1">{item.details}</span>
                          )}
                        </span>
                      </span>
                    )
                  })}
                </div>
              )}
            </SkillCategory>
          ))}
        </div>
      </SidebarSection>

      {/* Values */}
      {values && values.length > 0 && labels.sections.values && (
        <SidebarSection title={resolve(labels.sections.values)}>
          <div className="space-y-1">
            {values.map((value, i) => (
              <p key={i} className="text-sm text-resume-text-secondary">
                {resolve(value)}
              </p>
            ))}
          </div>
        </SidebarSection>
      )}

      {/* Spoken languages */}
      {spokenLanguages && spokenLanguages.length > 0 && labels.sections.languages && (
        <SidebarSection title={resolve(labels.sections.languages)}>
          <div className="space-y-1">
            {spokenLanguages.map((item, i) => (
              <p key={`${resolve(item.name)}-${i}`} className="text-sm">
                <span className="font-medium text-resume-text">{resolve(item.name)}</span>
                <span className="text-resume-text-secondary"> : {resolve(item.level)}</span>
              </p>
            ))}
          </div>
        </SidebarSection>
      )}

      {/* Hobbies */}
      {hobbies && hobbies.length > 0 && labels.sections.hobbies && (
        <SidebarSection title={resolve(labels.sections.hobbies)}>
          <div className="flex flex-col gap-2">
            {hobbies.map((hobby, i) => {
              const details = (hobby.details ?? []).map((d) => resolve(d)).join(' - ')
              return (
                <div key={`${resolve(hobby.title)}-${i}`}>
                  <p className="font-medium text-sm text-resume-text">{resolve(hobby.title)}</p>
                  {details && <p className="text-xs text-resume-text-secondary">{details}</p>}
                </div>
              )
            })}
          </div>
        </SidebarSection>
      )}
    </div>
  )
}
