import { splitTaskLabel } from '@/data/task-label'
import { TechBadge } from './TechBadge'

/** A titled group of task lines, each optionally followed by the badges of the techs involved. */
export interface ResolvedTaskGroup {
  title: string
  tasks: { text: string; techs?: string[] }[]
}

interface ExperienceDetailsContentProps {
  tasks?: string[]
  taskGroups?: ResolvedTaskGroup[]
  training?: string[]
  labels: {
    mainTasks: string
    training?: string
  }
  featured?: boolean
}

export function ExperienceDetailsContent({ tasks, taskGroups, training, labels, featured = false }: ExperienceDetailsContentProps) {
  return (
    <div className="space-y-3">
      {taskGroups?.map((group) => (
        <div key={group.title}>
          <p className={`${featured ? 'text-[0.8rem]' : 'text-[0.78rem]'} font-semibold text-resume-text mb-1.5`}>{group.title}</p>
          <ul className={`${featured ? 'text-[0.8rem]' : 'text-[0.78rem]'} text-resume-text-secondary space-y-1.5`}>
            {group.tasks.map((task, i) => {
              const { label, rest } = splitTaskLabel(task.text)
              return (
              <li key={i} className="flex items-start gap-2">
                <span className="text-resume-primary">&#8226;</span>
                <div>
                  <span className="whitespace-pre-line">
                    {label && <strong className="font-semibold text-resume-text">{label} </strong>}
                    {rest}
                  </span>
                  {task.techs && task.techs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {task.techs.map((tech) => (
                        <TechBadge key={tech} tech={tech} />
                      ))}
                    </div>
                  )}
                </div>
              </li>
              )
            })}
          </ul>
        </div>
      ))}
      {tasks && tasks.length > 0 && (
        <div>
          <ul className={`${featured ? 'text-[0.8rem]' : 'text-[0.78rem]'} text-resume-text-secondary space-y-1`}>
            {tasks.map((task, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-resume-primary">&#8226;</span>
                <span className="whitespace-pre-line">{task}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {training && training.length > 0 && labels.training && (
        <div>
          <p className="text-xs font-semibold text-resume-text mb-2">{labels.training}</p>
          <ul className="text-xs text-resume-text-secondary space-y-1">
            {training.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-resume-primary">&#8226;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
