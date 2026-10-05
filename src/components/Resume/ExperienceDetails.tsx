interface ExperienceDetailsContentProps {
  tasks?: string[]
  training?: string[]
  labels: {
    mainTasks: string
    training?: string
  }
}

export function ExperienceDetailsContent({ tasks, training, labels }: ExperienceDetailsContentProps) {
  return (
    <div className="space-y-3">
      {tasks && tasks.length > 0 && (
        <div>
          <ul className="text-xs text-resume-text-secondary space-y-1">
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
