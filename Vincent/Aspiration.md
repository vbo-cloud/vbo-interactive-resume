# Aspiration — Orchestration IA

## Où j'en suis

Le pipeline job-finder est un **pipeline LLM multi-étapes** (offer-fetching → cv-analysis →
matching → cv-review), pas une vraie **orchestration d'agents autonomes**. Chaque étape
appelle un LLM une fois pour une tâche fixe (extraire, scorer, matcher) ; c'est l'infra
classique (Service Bus, Container App Jobs) qui enchaîne les étapes, pas le LLM qui décide
lui-même de la suite. Solide base infra/cloud, mais pas encore de la vraie IA agentique.

Le seul vrai agent construit à ce jour : le **reviewer de code Claude en CI/CD**, qui décide
seul APPROVE/REQUEST_CHANGES.

## Ce qu'il faudrait faire pour progresser vers l'orchestration IA

- Construire un projet avec un **vrai framework d'agents** (LangGraph, CrewAI, AutoGen, ou le
  SDK d'agents Anthropic), avec une boucle de raisonnement itérative (type ReAct) : le LLM
  choisit lui-même les outils/actions à enchaîner, au lieu d'un pipeline figé.
- Ce projet transformerait la base infra déjà solide (cloud, IaC, CI/CD, intégration LLM) en
  compétence agentique concrète et démontrable.

## Positionnement CV

- **"Automatisation"** (sous-titre) : solide aujourd'hui (CI/CD, IaC, pipelines).
- **"Orchestration IA"** (sous-titre) : aspirationnel — direction de carrière assumée, pas une
  expertise acquise. À garder tel quel sur le CV, mais être honnête en entretien si challengé
  sur la définition technique d'un "agent".
