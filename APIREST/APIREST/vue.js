<script src="https://unpkg.com/vue@next"></script>


<div id="app">
  <ul>
    <li v-for="participant in participants" :key="participant.id">
      {{ participant.nom }} {{ participant.prenom }}
      <!-- Boutons ou liens pour modifier/supprimer -->
    </li>
  </ul>
</div>

<script>
const { createApp } = Vue;

createApp({
  data() {
    return {
      participants: []
    };
  },
  mounted() {
    this.fetchParticipants();
  },
  methods: {
    fetchParticipants() {
      fetch('api/list.php')
        .then(response => response.json())
        .then(data => {
          this.participants = data;
        });
    },
    // Ajoutez ici des méthodes pour ajouter, modifier, supprimer
  }
}).mount('#app');
</script>

