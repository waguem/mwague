### Case 01 : Effectuer un envoi sur minkadi

### Acteur principal

- [ ] Client

### Acteurs secondaires

- [ ] Gestionnaire de taux
- [ ] Secure Payment

### Objectifs

- [ ] le client veut effectuer un envoi d'un montant X dans un pays destinataire 

### Preconditions

- [ ] le client a dejà un compte et est authentifié (voir le cas d'utilisation S'authentifier)
- [ ] Il y'a un agent disponible dans la localité selectioné
- [ ] le moyent de paiement selectioné est disponible 
- [ ] le client a ajouté un moyen de paiement
- [ ] le client a ajouté ses docuements d'identiés.

### Postconditions

- [ ] une nouvelle transaction est ajoutée en cas de succès de paiement, l'agent est notifié, le client est notifié, la transaction est ajouté dans la liste des transactions du client et de l'agent

### **Scenario***

- [ ] 1 - Le Gestionnaire de stock met à jour la base des taux (ou un employé le fait manuellement)
- [ ] 2 - Le client se connecte sur son compte
- [ ] 3 - Dans le formulaire d'envoi, il choisit la destination d'envoi, le taux d'envoi
- [ ] 4 - Entre les informations du destinataire
- [ ] 5 - Choisi le lieu de retrait et moyen de retrait (paiement mobile ou retrait en espèces )
- [ ] 6 - Choisi le moyen de paiement si plusieurs possibles
- [ ] 7 - Suit le processus de paiement
- [ ] 8 - Après validation redirigé vers la transaction, peut demander le renvoi du mail de confirmation jusqu'à trois fois

### Alternatives

- [ ] 2a - Le client a un compte mais n'as plas encore validé son email
	- [ ] Le client peut demander le renvoi du mail de validation pour valider son emai
	- [ ]  Le client peut changer son mail 
- [ ] 2b - Le client a un compte valide mais n'as pas encore validé son document d'identité
	- [ ] Le client doit ajouter son pièce d'identité au format pdf, image 
	- [ ] Une fois le document soumis, le document est transmis au service client pour review et validation
	- [ ] Une fois que le compte est validé, si il y'a un envoi encours qui était en pause, redirigé le client vers la finalisation d'envoi.
- [ ] 3a - Le client entre des données invalid
	- [ ] Le formulaire montre une erreur, et refuse de faire une soumission
- [ ] 5a - Le lieu de retrait choisi ne montre aucun agent qui peut payer si le moyen de paiement choisi est un retrait physique
	- [ ] Un message d'erreur est affiché pour lui proposer une alternative 
- [ ] 7a - Echec de paiement du client
	- [ ]  Toutes les informations sont enregistrées, saut les informations bancaires
	- [ ]   La transaction n'est pas créer 
	- [ ]  On propose au client de changer le moyent de paiement et le cycle se retourne au 7

