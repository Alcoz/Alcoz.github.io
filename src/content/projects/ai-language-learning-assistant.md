---
title: 'Assistant d’apprentissage des langues'
summary: 'Professeur de langue conversationnel, à l’écrit comme à l’oral, qui tourne entièrement en local avec des modèles open source.'
date: 2026-07-18
tags: ['IA', 'LLM', 'Ollama', 'FastAPI', 'Whisper', 'Langfuse']
repo: 'https://github.com/Alcoz/ai-language-learning-assistant'
---

## Contexte

L'élève discute avec une IA dans la langue qu'il apprend, en tapant ou en parlant. Le professeur s'adapte à son niveau CECRL et corrige les erreurs une par une, en guidant l'élève vers la bonne réponse plutôt qu'en la donnant directement.

Configuration actuelle : un élève francophone qui apprend l'italien, niveau A1. Tout tourne sur la machine de l'utilisateur : aucune conversation ne part chez un tiers.

## Architecture

```
┌──────────────┐   HTTP    ┌─────────────────────┐
│    front     │ ────────► │ conversation-engine │
│ (Streamlit)  │ ◄──────── │      (FastAPI)      │
└──────────────┘  stream   └──────────┬──────────┘
                                      │
              ┌────────────┬──────────┼────────────┐
              ▼            ▼          ▼            ▼
           Ollama    faster-whisper  Kokoro     Langfuse
           (LLM)        (STT)        (TTS)     (tracing)
```

| Module | Rôle |
| --- | --- |
| **conversation-engine** | API : `/query` envoie l'historique au LLM et streame la réponse, `/stt` transcrit un enregistrement, `/tts` lit un texte à voix haute. |
| **front** | Interface de chat : garde l'historique, enregistre le micro et lit les réponses. |
| **model-evaluation** | Évaluation des modèles de transcription et du professeur. |

## Technologies utilisées

| Composant | Technologie | Pourquoi |
| --- | --- | --- |
| LLM | Ollama + Qwen 3.5 (4B) | Gratuit et local. Un modèle 4B tourne sur un portable, et le mode « thinking » est désactivé pour répondre sans délai. |
| Speech-to-text | faster-whisper (`small`, int8, CPU) | Bon compromis qualité / vitesse sans GPU. |
| Text-to-speech | Kokoro-82M | Modèle léger et local, avec une voix italienne naturelle. |
| API | FastAPI + Uvicorn | Streaming et upload de fichiers natifs, validation des requêtes avec Pydantic. |
| Interface | Streamlit | Chat, streaming, enregistrement micro et lecture audio en quelques lignes, découplé de l'API. |
| Observabilité | Langfuse | Trace chaque génération (tokens, latence) et regroupe les traces par session pour rejouer une conversation. |
| Évaluation | MLflow, jiwer, Label Studio | Comparaison des modèles Whisper sur des enregistrements annotés (WER, CER, vitesse). |
| Stockage | S3 (MinIO, AWS S3 ou GCS) | Archivage des enregistrements et des datasets d'évaluation. |
| Packaging et qualité | uv (workspace), Ruff, pre-commit | Plusieurs packages indépendants avec un seul lockfile, lint et formatage à chaque commit. |

## Choix de développement

- **100 % local.** LLM, transcription et synthèse vocale tournent sur la machine : pas de coût d'API et aucune donnée d'élève envoyée à l'extérieur.
- **Instructions séparées de l'historique.** Les consignes du professeur passent en message `system`, à part de la conversation : le modèle distingue mieux les règles des échanges, et les traces restent lisibles.
- **Prompt versionné.** Les instructions du professeur sont versionnées dans Langfuse ; l'étiquette `production` désigne la version utilisée, ce qui permet de modifier le prompt sans toucher au code.
- **Une transcription qui garde les fautes.** Whisper reçoit un prompt qui demande une transcription mot à mot, erreurs comprises : sans elles, le professeur n'aurait rien à corriger.
- **Front et API découplés.** L'interface Streamlit ne fait qu'appeler l'API : elle peut être remplacée sans toucher au moteur de conversation.

## Qualité et évaluation

- **Benchmark de la transcription.** Les enregistrements des élèves peuvent être archivés sur S3 avec leur transcription, annotés dans Label Studio, puis chaque modèle Whisper est évalué dans MLflow (WER, CER, vitesse) sur un dataset identifié par son empreinte.
- **LLM-as-a-judge.** Un modèle local plus gros note chaque réponse du professeur de 1 à 5 sur trois critères : cohérence avec le message de l'élève, niveau du vocabulaire et complexité des phrases au regard du niveau CECRL. Les notes sont attachées aux traces Langfuse avec le raisonnement du juge.
- **Benchmark des modèles professeurs.** Plusieurs LLM répondent aux mêmes conversations tracées, avec leur vitesse de génération, puis sont notés par le juge ; un seul modèle est chargé en mémoire à la fois.
- **Lint et formatage** automatiques avec Ruff et pre-commit.
