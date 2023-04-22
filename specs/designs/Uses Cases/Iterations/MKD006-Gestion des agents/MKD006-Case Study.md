### Case 06 : Gestion des agents

### Acteur principal

- [ ] Service client (employé)

### Objectifs

- [ ] Permettre au service client de gérer les agents collaborateurs
  - [ ] Ajouter un agent
  - [ ] Activer le compte d'un agent
  - [ ] Desactiver le compte d'un agent
  - [ ] Modifier les informations de l'agent
    - [ ] Location
    - [ ] Moyens de paiements et monaies (se limiter à un)
    - [ ] contacts

### Préconditions

- [ ] être authentifié
- [ ] appartenir au groupe service client
- [ ] avoir les droits de Gestion des utilisateurs

### \*\*Scenario

### \*\*\*Intermediaire

- [ ] Recherche Rapide
  - [ ] une liste paginé des agents est montré dans la page d'acceuil permettant
        de naviguer, de faire des recherches locales
- [ ] Recherche avancé
  - [ ] un formulaire de recherche est affiché , où l'employé peut entrer
        plusieurs critères de recherches
- [ ] 1 - page d'acceuil de gestion
- [ ] 2- naviguer sur la sections agents
- [ ] 3 - ajouter un agent
  - [ ] 3-1 clicker sur le bouton ajouter
  - [ ] 3-2 remplir les informations
  - [ ] 3-3 valider les informations
  - [ ] 3-4l'agent est ajouter dans la liste des agents
- [ ] 4 - modifier les informations d'un agent
  - [ ] faire une recherche rapide de l'agent
  - [ ] si agent trouvé, choisir l'option modifier
  - [ ] redirection vers la page de modification
  - [ ] modification des informations necessaires
  - [ ] validation de la modification
- [ ] 5 - activer le compte d'un agent
  - [ ] l'agent doit fournir un email valid
  - [ ] envoi un mail de confirmation à l'agent
    - [ ] un lien de redirection permet de recupérer un token valid (durée 24⏳
          )
    - [ ] l'agent confirme son email
  - [ ] une fois que l'agent confirme son email, son compte devient actif
- [ ] 6 - desactiver le compte d'un agent
