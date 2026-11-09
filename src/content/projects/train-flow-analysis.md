---
title: 'Ponctualité des trains SNCF'
summary: 'Plateforme de données qui collecte en continu les horaires et les retards SNCF pour mesurer la ponctualité de chaque train.'
date: 2026-04-22
tags: ['Data Engineering', 'Dagster', 'dbt', 'DuckDB', 'Polars']
repo: 'https://github.com/Alcoz/train-flow-analysis'
cover: './images/rail.jpg'
coverAlt: 'Voies ferrées'
---

## Contexte

Chaque jour, la SNCF publie les **horaires théoriques** de ses trains (GTFS) et, toutes les quelques minutes, les **prévisions de retard en temps réel** (GTFS-RT). Aucune de ces sources ne dit, à elle seule, si un train est arrivé à l'heure.

Le projet collecte ces flux en continu, les stocke dans un data lake S3 et construit chaque jour un entrepôt dimensionnel qui donne, pour chaque train et chaque arrêt, son retard réel. Les alertes trafic (travaux, incidents) sont aussi collectées et rattachées aux trains concernés.

## Architecture

Le pipeline suit une architecture **Medallion** (Bronze / Silver / Gold), orchestrée par Dagster :

```
 GTFS (zip, 1×/jour)   GTFS-RT retards (2 min)   GTFS-RT alertes (5 min)
          │                      │                         │
          ▼                      ▼                         ▼
 Bronze   fichiers bruts, tels que renvoyés par les API (.zip, .pb)
          │  partition quotidienne, construite à 03:00 pour la veille
          ▼
 Silver   tables nettoyées et typées (Parquet, Polars)
          │  dbt build sur DuckDB, lecture/écriture S3
          ▼
 Gold     schéma en étoile partitionné par date (Parquet)
          │
          ▼
 BigQuery tables externes et vues hebdomadaires
```

| Couche | Contenu | Construit par |
| --- | --- | --- |
| **Bronze** | Fichiers bruts des API SNCF, conservés tels quels | Assets Dagster (Python) |
| **Silver** | Une table Parquet par table GTFS, retards et alertes aplatis | Assets Dagster (Polars) |
| **Gold** | Dimensions dates, lignes, alertes et faits de retard par train | dbt + DuckDB |

## Technologies utilisées

| Composant | Technologie | Pourquoi |
| --- | --- | --- |
| Orchestration | Dagster | Assets, partitions quotidiennes, asset checks, schedules et intégration dbt native : tout le lignage, de Bronze à Gold, est visible au même endroit. |
| Transformations Silver | Polars | Rapide et typé strictement : les identifiants restent des chaînes et seules les colonnes numériques et dates connues sont converties. |
| Entrepôt Gold | dbt + DuckDB | DuckDB lit et écrit directement le Parquet sur S3 (httpfs), sans serveur de base de données ; dbt apporte contrats, tests et documentation. |
| Stockage | S3 (MinIO en local, GCP en cloud) | Le même code tourne en local et en production grâce à une API compatible S3. |
| Exposition | BigQuery | Tables externes sur les fichiers Gold : un nouveau jour est visible sans rechargement. |
| Métadonnées Dagster | PostgreSQL | Stockage des runs et des événements. |
| Déploiement | Docker Compose, GitHub Actions | Serveur de code, webserver et daemon Dagster en conteneurs, déployés par SSH. |
| Packaging et qualité | uv (workspace), Ruff, pre-commit, pytest + moto | Plusieurs packages avec un seul lockfile, lint automatique, tests unitaires avec S3 simulé. |

## Choix de développement

- **Garder le brut.** Bronze stocke les réponses des API sans les modifier : toute couche suivante peut être reconstruite à partir de lui.
- **Partitions idempotentes.** Chaque partition Silver et Gold est quotidienne (fuseau Europe/Paris) : reconstruire un jour réécrit les mêmes fichiers, ce qui rend les backfills sûrs.
- **Date de circulation plutôt que date de collecte.** Les trains de nuit envoient des mises à jour après minuit : le jour J est donc construit à J+1 à 03:00, en lisant aussi les snapshots du lendemain.
- **Statut de chaque train.** La SNCF retire des trains du GTFS avant leur jour de circulation. En comparant les 30 dernières versions du GTFS, chaque train est classé *prévu*, *supprimé tardivement* (moins de 3 jours avant) ou *déprogrammé*. Le seuil de 3 jours vient de l'analyse de 279 trains retirés, qui forment deux groupes nettement séparés.
- **Retard au terminus effectif.** Le retard est mesuré au dernier arrêt réellement desservi, pour ne pas perdre les trains limités en cours de route.
- **Classification des alertes par le texte.** Les champs standard `cause` et `effect` sont presque toujours vides ou génériques : les alertes sont classées à partir de leur texte, via une table de règles versionnée en seed dbt.
- **Séparer la logique de l'orchestration.** La librairie `data-eng` (fonctions Python + projet dbt) ne dépend d'aucun orchestrateur ; le projet Dagster l'appelle. Le cœur métier peut ainsi être testé et réutilisé seul.

## Qualité et déploiement

- Modèles dbt avec **contrats** et **tests** (unicité, non-nullité, valeurs acceptées, relations), et une `exposure` pour chaque vue BigQuery qui les lit.
- **Asset checks** Dagster qui signalent un GTFS incomplet sans bloquer le pipeline.
- **CI/CD GitHub Actions** : lint Ruff et tests pytest à chaque push, puis déploiement automatique sur le serveur pour la branche principale.
- **Supervision** : message Discord au premier échec d'un job et à sa reprise, et ping Healthchecks.io après chaque run planifié réussi pour détecter un daemon bloqué.
