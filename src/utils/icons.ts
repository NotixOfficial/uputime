import { IconName } from '../components';
import { InstitutionType, ProcedureCategory } from '../data/types';

export function iconForCategory(category: ProcedureCategory): IconName {
  switch (category) {
    case 'licna-dokumenta': return 'credit-card';
    case 'boraviste': return 'home';
    case 'vozila': return 'car';
    case 'biznis': return 'briefcase';
    case 'obrazovanje': return 'graduation-cap';
    case 'komunalije': return 'droplet';
    default: return 'file-text';
  }
}

export function iconForInstitutionType(type: InstitutionType): IconName {
  switch (type) {
    case 'mup': return 'shield';
    case 'opstina': return 'building';
    case 'apr': return 'briefcase';
    case 'poreska': return 'file-text';
    case 'sud': return 'landmark';
    case 'maticar': return 'file-text';
    case 'komunalno': return 'droplet';
    case 'obrazovanje': return 'graduation-cap';
    default: return 'map-pin';
  }
}
