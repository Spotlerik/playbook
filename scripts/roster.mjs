// Het team, als data. Eén plek, gebruikt door create-users.mjs.
//
// Twee e-maildomeinen: @spotler.com en @spotler.nl. Alles wordt naar kleine
// letters genormaliseerd voordat het de database in gaat — profiles heeft een
// CHECK die dat afdwingt, dus een hoofdletter hier zou de insert laten klappen.
//
// hubspot_owner_id en jiminny_user_id blijven leeg tot Sean en Bjorn leveren.

export const TEAM = { name: 'NL - New Business & Cross Sell Martech', market: 'NL' };

export const ROSTER = [
  { full_name: 'Sjoerd de Jong',       email: 'sjoerd.dejong@spotler.com',       role: 'rep' },
  { full_name: 'Rick Dekker',          email: 'rick.dekker@spotler.nl',          role: 'rep' },
  { full_name: 'Boris Mileusnic',      email: 'boris.mileusnic@spotler.com',     role: 'rep' },
  { full_name: 'Manuela Crielaard',    email: 'manuela.crielaard@spotler.com',   role: 'rep' },
  { full_name: 'Sander te Loo',        email: 'sander.teloo@spotler.com',        role: 'rep' },
  { full_name: 'Ivo Klein',            email: 'ivo.klein@spotler.com',           role: 'rep' },
  { full_name: 'Robbert Brouwer',      email: 'robbert.brouwer@spotler.com',     role: 'rep' },
  { full_name: 'Jasper Koenraad',      email: 'jasper.koenraad@spotler.nl',      role: 'rep' },
  { full_name: 'Nick van Dijk',        email: 'nick.vandijk@spotler.com',        role: 'rep' },
  { full_name: 'Marthijn Dam Wichers', email: 'marthijn.damwichers@spotler.com', role: 'rep' },

  { full_name: 'Glenn van Dam',        email: 'glenn.vandam@spotler.com',        role: 'manager' },
  { full_name: 'Niels den Daas',       email: 'niels.dendaas@spotler.com',       role: 'manager' },
  { full_name: 'Russell Flawn',        email: 'russell.flawn@spotler.com',       role: 'manager' },
  { full_name: 'Erik de Kock',         email: 'erik.dekock@spotler.com',         role: 'manager' },
];
