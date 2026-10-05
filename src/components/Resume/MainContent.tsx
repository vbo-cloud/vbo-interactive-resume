import { useTranslation } from '@/lib/i18n'
import { resumeConfig } from '@/data/resume-config'
import { assetUrl, reverseDateRange } from '@/lib/utils'
import { detectedAssets } from 'virtual:detected-assets'
import { ExperienceItem } from './ExperienceItem'
import { ProjectItem } from './ProjectItem'
import { EducationItem } from './EducationItem'
import { ProfilePhoto } from './ProfilePhoto'
import { SidebarSection } from './SidebarSection'
import { ContactItem } from './ContactItem'
import { ReferentItem } from './ReferentItem'

export function MainContent() {
  const { resolve, resolveArray } = useTranslation()
  const { personal, contact, referents, featuredProject, experiences, projects, education, labels } = resumeConfig

  const experienceLabels = {
    mainTasks: resolve(labels.experience.mainTasks),
    training: labels.experience.training ? resolve(labels.experience.training) : undefined,
  }

  return (
    <div className="md:w-[71%] p-8">
      {/* Header */}
      <div className="mb-[1.6rem]">
        <div className="flex items-center gap-4 md:block">
          {/* Photo — mobile only, shown to the left of the name; desktop photo lives in Sidebar */}
          <ProfilePhoto
            photo={(personal.photo || detectedAssets.photo) ? assetUrl(personal.photo || detectedAssets.photo!) : undefined}
            name={personal.name}
            emoji={personal.photoBackEmoji}
            size="sm"
            className="md:hidden"
          />
          <h1 className="flex-1 text-left md:text-center text-2xl md:text-[1.55rem] font-bold tracking-[0.1em] text-resume-text">
            {personal.name.toUpperCase()}
          </h1>
        </div>
        <div className="text-center">
          <p className="text-[0.85rem] text-resume-text-secondary tracking-[0.08em] mt-2">
            {resolve(personal.title).toUpperCase()}
          </p>
          {personal.tagline && (
            <p className="text-[0.68rem] uppercase tracking-wide text-resume-text-secondary/70 mt-1">
              {resolve(personal.tagline)}
            </p>
          )}
          {personal.subtitle && (
            <p className="md:hidden text-sm text-resume-text-secondary italic text-left mt-5">
              {resolve(personal.subtitle)}
            </p>
          )}
        </div>
      </div>

      {/* Contact — mobile only, shown between the tagline and Experience; desktop contact lives in Sidebar */}
      <SidebarSection title={resolve(labels.sections.contact)} className="md:hidden">
        <div className="space-y-3">
          {contact.map((item) => (
            <ContactItem key={`${item.type}-${item.label}`} type={item.type} label={item.label} href={item.href} />
          ))}
        </div>
      </SidebarSection>

      {/* Referents — mobile only, shown right under Contact; desktop referents live in Sidebar */}
      {referents?.length && labels.sections.referent ? (
        <SidebarSection title={resolve(labels.sections.referent)} className="md:hidden">
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

      {/* Flagship project — shown first, same ExperienceItem format as the timeline below */}
      {featuredProject && labels.sections.featuredProject && (
        <div className="mb-[1.6rem]">
          <h2 className="text-[0.78rem] font-bold tracking-widest text-resume-text mb-[0.9rem] pb-[0.4rem] border-b border-resume-primary/20">
            {resolve(labels.sections.featuredProject)}
          </h2>
          <ExperienceItem
            year={reverseDateRange(resolve(featuredProject.period))}
            company={resolve(featuredProject.title)}
            type={featuredProject.type ? resolve(featuredProject.type) : undefined}
            role={featuredProject.role ? resolve(featuredProject.role) : ''}
            url={featuredProject.url}
            description={featuredProject.description ? resolve(featuredProject.description) : ''}
            techs={featuredProject.techs ?? []}
            details={{ tasks: resolveArray(featuredProject.bullets) }}
            labels={experienceLabels}
          />
        </div>
      )}

      {/* Experiences */}
      <div className="relative">
        <h2 className="text-[0.78rem] font-bold tracking-widest text-resume-text mb-[0.9rem] pb-[0.4rem] border-b border-resume-primary/20">
          {resolve(labels.sections.experience)}
        </h2>
        <div className="space-y-4">
          {experiences.map((exp, i) => (
            <div key={exp.id}>
              {i > 0 && <div className="h-px w-[94%] mx-auto mb-[0.2rem] bg-resume-sidebar-from" />}
              <ExperienceItem
                year={reverseDateRange(resolve(exp.period))}
                company={resolve(exp.company)}
                type={exp.type ? resolve(exp.type) : undefined}
                role={resolve(exp.role)}
                url={exp.url}
                description={resolve(exp.description)}
                techs={exp.techs}
                details={
                  exp.details
                    ? {
                        tasks: exp.details.tasks ? resolveArray(exp.details.tasks) : undefined,
                        training: exp.details.training ? resolveArray(exp.details.training) : undefined,
                      }
                    : undefined
                }
                subItem={
                  exp.subItem
                    ? {
                        title: resolve(exp.subItem.title),
                        description: resolve(exp.subItem.description),
                      }
                    : undefined
                }
                labels={experienceLabels}
                isHighlighted={exp.isHighlighted}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      {projects && projects.length > 0 && labels.sections.projects && (
        <div className="mt-[1.6rem]">
          <h2 className="text-[0.78rem] font-bold tracking-widest text-resume-text mb-[0.9rem] pb-[0.4rem] border-b border-resume-primary/20">
            {resolve(labels.sections.projects)}
          </h2>
          <div className="space-y-1">
            {projects.map((project) => (
              <ProjectItem
                key={project.id}
                title={resolve(project.title)}
                description={resolve(project.description)}
                techs={project.techs}
                url={project.url}
                github={project.github}
              />
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      <div className="mt-[1.6rem]">
        <h2 className="text-[0.78rem] font-bold tracking-widest text-resume-text mb-[0.9rem] pb-[0.4rem] border-b border-resume-primary/20">
          {resolve(labels.sections.education)}
        </h2>
        <div className="space-y-3">
          {education.map((edu, i) => (
            <EducationItem
              key={`${resolve(edu.school)}-${resolve(edu.degree)}-${edu.period ?? i}`}
              school={resolve(edu.school)}
              degree={resolve(edu.degree)}
              specialty={edu.specialty ? resolve(edu.specialty) : undefined}
              details={edu.details ? resolve(edu.details) : undefined}
              period={edu.period}
              logo={edu.logo}
              badge={edu.badge ? resolve(edu.badge) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
