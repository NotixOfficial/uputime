import { NavigatorScreenParams } from '@react-navigation/native';

/** Stack: Tab "Pitaj". Razgovor je store-driven (currentId u useChatStore). */
export type AskStackParamList = {
  ChatHome: undefined;
  Conversation: undefined;
};

/** Stack: Tab "Dokumenti". */
export type DocumentsStackParamList = {
  DocumentsList: undefined;
  ProcedureDocuments: { procedureId: string };
  ProcedureSteps: { procedureId: string };
};

/** Stack: Tab "Mapa". */
export type MapStackParamList = {
  MapHome: { focusInstitutionId?: string; focusNonce?: number } | undefined;
  InstitutionDetail: { institutionId: string };
};

/** Stack: Tab "Rokovi". */
export type RemindersStackParamList = {
  RemindersList: undefined;
  NewReminder: { documentType?: string } | undefined;
};

/** Stack: Tab "Profil". */
export type ProfileStackParamList = {
  ProfileHome: undefined;
  Auth: { mode: 'signin' | 'register' } | undefined;
  History: undefined;
  Language: undefined;
  Privacy: undefined;
  About: undefined;
};

/** Tab navigator , hub-and-spoke (DTI). */
export type RootTabParamList = {
  AskTab: NavigatorScreenParams<AskStackParamList>;
  DocumentsTab: NavigatorScreenParams<DocumentsStackParamList>;
  MapTab: NavigatorScreenParams<MapStackParamList>;
  RemindersTab: NavigatorScreenParams<RemindersStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

/** Root stack , Onboarding pa glavni tabovi. */
export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<RootTabParamList>;
};
