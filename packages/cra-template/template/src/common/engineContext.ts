import {Engine} from '@coveo/headless';
import {createContext} from 'react';

const EngineContext = createContext<Engine | null>(null);

export const EngineProvider = EngineContext.Provider;

export default EngineContext;
