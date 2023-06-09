import './styles.css';
import { useStorybookThemeObserver } from '@vegaprotocol/utils';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: { disable: true },
  themes: {
    default: 'dark',
    list: [
      { name: 'dark', class: ['dark', 'bg-black'], color: '#000' },
      { name: 'light', class: '', color: '#FFF' },
    ],
  },
};

export const decorators = [
  (Story) => {
    useStorybookThemeObserver();

    return (
      <div style={{ width: '100%', height: 500 }}>
        <Story />
      </div>
    );
  },
];
