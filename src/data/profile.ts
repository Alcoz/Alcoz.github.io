// Toutes les informations personnelles du site sont centralisées ici.
// Remplace les valeurs d'exemple par les tiennes.

export const profile = {
	name: 'Baptiste Darnala',
	// Chaque segment séparé par « / » s'affiche sur sa propre ligne ; le premier est mis en avant.
	title: 'Docteur en intelligence artificielle / ML Engineer / Data Engineer',
	// Un élément du tableau = un paragraphe.
	bio: [
		'Data Engineer avec un background en Data Science et IA, spécialisé dans la conception de pipelines de données, l’intégration de données hétérogènes et le déploiement de solutions data. Je travaille principalement avec Python et SQL, autour de problématiques de data ingestion, transformation, data modeling, orchestration et data quality. Stack principale : Python, SQL, PostgreSQL, dbt, Dagster, Airflow, Docker, Git/GitHub, CI/CD, S3/MinIO et GCP.',
		'Mon parcours en Data Science et en recherche m’a également permis de travailler sur le machine learning, les ontologies, les knowledge graphs, le NLP et les applications RAG/LLM, notamment avec PyTorch, scikit-learn, FastAPI et LangChain.',
		'Je m’intéresse particulièrement aux problématiques de Data Engineering, Data Platform et MLOps : construire des pipelines fiables, automatiser les traitements et mettre en production des solutions data et ML.',
	],
	// Expressions de la bio mises en valeur (surlignées).
	highlights: ['Data Engineering', 'Data Platform', 'MLOps', 'Data Science', 'IA'],
	// Expressions de la bio mises en gras.
	strong: ['Python', 'SQL', 'PyTorch', 'LangChain', 'dbt', 'Dagster', 'Airflow'],
	interests: ['Intelligence Artificielle', 'Data Engineering', 'MLOPS'],
	// Optionnels : laisse vide pour masquer.
	photo: '', // ex. '/photo.jpg' (fichier placé dans public/)
	location: '', // ex. 'Paris, France'
	email: 'baptiste.darnala.sec@gmail.com',
	links: {
		linkedin: 'https://www.linkedin.com/in/baptiste-darnala',
		github: 'https://github.com/Alcoz',
	},
};

// Identifiants (nom de fichier sans extension) des projets mis en avant
// sur la page d'accueil, dans l'ordre d'affichage.
export const featuredProjects = ['train-flow-analysis', 'ai-language-learning-assistant'];

export type Experience = {
	role: string;
	company: string;
	location?: string;
	start: string;
	end?: string; // vide = poste actuel
	missions?: string[];
};

export const experiences: Experience[] = [
	{
		role: 'Data Scientist',
		company: 'Elzeard',
		location: 'Bordeaux',
		start: 'oct. 2024',
		end: 'avr. 2026',
		missions: [
			'Conception et déploiement d’un chatbot RAG basé sur l’API Mistral, LangChain et Chroma, conteneurisé avec Docker.',
			'Conception des flux d’ingestion et d’indexation des données métier nécessaires au système de récupération d’information.',
			'Développement d’une plateforme de visualisation de données agricoles avec Streamlit et Plotly, intégrant des flux de données métier hétérogènes.',
			'Contribution à l’intégration et à l’interopérabilité de données entre différentes plateformes dans le cadre du DataFoodConsortium.',
		],
	},
	{
		role: 'Doctorant CIFRE',
		company: 'Elzeard et LIRMM',
		location: 'Bordeaux, Montpellier',
		start: 'févr. 2021',
		end: 'oct. 2024',
		missions: [
			'Modélisation et structuration de données métier complexes sous forme d’ontologies RDF, OWL et SKOS, avec mise en place d’un graphe de connaissances sous GraphDB.',
			'Structuration et normalisation de données hétérogènes issues d’une application métier afin d’améliorer leur cohérence et leur exploitabilité.',
			'Conception de processus d’alignement et d’intégration de données provenant de ressources externes, notamment à l’aide de méthodes NLP.',
			'Développement de modèles prédictifs avec scikit-learn et PyTorch pour la planification des cultures.',
			'Contribution à une ontologie open source dédiée à l’interopérabilité des plateformes de circuits courts dans le cadre du DataFoodConsortium.',
		],
	},
];

export type Degree = {
	name: string;
	school: string;
	location?: string;
	start: string;
	end: string;
	description?: string;
};

export const education: Degree[] = [
	{
		name: 'Doctorat en informatique',
		school: 'I2S - Université de Montpellier',
		location: 'Montpellier',
		start: '2021',
		end: '2024',
	},
	{
		name: 'Master DECOL (Data, IA, Knowledge, NLP)',
		school: 'Université de Montpellier',
		location: 'Montpellier',
		start: '2018',
		end: '2020',
	},
	{
		name: 'Licence Informatique',
		school: 'Université de Montpellier',
		location: 'Montpellier',
		start: '2015',
		end: '2018',
	},
];
