/** Labb 3 - Startkod **/

/* ********************************************************* */
/* *** Uppsättning av variabler och hjälpfunktioner. *** */

/* Läs, men förändra inte nedanstående funktioner.
 * Uppgifter kan bero på dem och du behöver veta vad uppgifterna refererar till.
 * Ändra inget i koden förrän du ser texten "Uppsättning färdig" i kommentarerna.
 */

const PORT = process.env.PORT || 3000;

// Hjälpare för id-generering (använd den i Uppgift 3)
function nextId() {
  const n = tasks.length + 1;
  return String(n).padStart(3, "0");
}

//Fördefinierad array som simulerar lagring av uppgifter
const tasks = []; // ändra inte namnet på denna variabel

/* *** Uppsättning färdig *** */

/* ********************************************************* */
/* *** Labb 3 start *** */

/* **  Uppgift 0:
 * I terminalen, kör npm install för att installera allt som krävs för att utföra och testa labben.
 ** */

/* ** Uppgift 1:
 * Importera express-modulen, skapa och starta servern.
 * Servern ska köras på porten lagrad i den *befintliga* variabeln PORT
 * Konfigurera servern så att den kan ta emot data i JSON-format.
 * Skriv din kod här nedanför: ** */
const express = require("express");
const server = express();

server.use(express.json());

server.listen(PORT, () => {
  console.log("Server is running on http://localhost:3000");
});

/* ** Uppgift 2:
 * Skapa endpointen GET /tasks.
 * Svaret ska bestå av hela tasks-arrayen, dvs. *alla* tasks.
 *
 * Skriv din kod här nedanför: ** */
server.get("/tasks", (req, res) => {
  res.send(tasks);
});

/* ** Uppgift 3:
 * Skapa endpointen POST /tasks. Den ska simulera att en ny uppgift (task) skapas,
 * genom att lägga till den i tasks-arrayen.
 * En task ska ha:
 *  - id: unikt, genereras med hjälpfunktionen nextId()
 *  - title: skickas av användaren, obligatorisk
 *  - dueDate: skickas av användaren
 *  - done: om uppgiften är klar eller inte (en nyskapad uppgift är inte klar)
 * Om indata är ofullständig (t.ex. title saknas) ska servern svara med en lämplig felkod.
 * Annars ska servern svara med den skapade uppgiften och en statuskod som visar att något har skapats.
 *
 * Skriv din kod här nedanför: ** */

/* ** Uppgift 4:
 * Skapa en GET-endpoint för att hämta *en* task.
 * Id för önskad task ska tas emot som en url-parameter.
 * Servern ska svara med den task som hittas, eller med en lämplig felkod om ingen task med det id:t finns.
 *
 * Skriv din kod här nedanför: ** */
