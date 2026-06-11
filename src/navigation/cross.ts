// Navigacija između tabova: bilo koji ekran može otvoriti ekran u drugom tabu.
// Poziv ide do tab navigatora, pa radi i iz ugnežđenih stack-ova.

type Nav = { navigate: (name: string, params?: object) => void };

export const goToProcedureDocuments = (nav: Nav, procedureId: string) =>
  nav.navigate('DocumentsTab', { screen: 'ProcedureDocuments', params: { procedureId } });

export const goToProcedureSteps = (nav: Nav, procedureId: string) =>
  nav.navigate('DocumentsTab', { screen: 'ProcedureSteps', params: { procedureId } });

// Nonce osigurava da se mapa re-centrira čak i pri fokusiranju iste institucije.
let focusNonce = 0;
export const goToMapFocus = (nav: Nav, focusInstitutionId: string) =>
  nav.navigate('MapTab', {
    screen: 'MapHome',
    params: { focusInstitutionId, focusNonce: ++focusNonce },
  });

export const goToNewReminder = (nav: Nav, documentType?: string) =>
  nav.navigate('RemindersTab', { screen: 'NewReminder', params: { documentType } });

export const goToConversation = (nav: Nav) =>
  nav.navigate('AskTab', { screen: 'Conversation' });
