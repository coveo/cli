import {SearchEngine} from '@coveo/headless';
import {createContext} from 'react';

const EngineContext = createContext<SearchEngine | null>(null);

export const EngineProvider = EngineContext.Provider;

export default EngineContext;
