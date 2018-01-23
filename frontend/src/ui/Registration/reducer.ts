import { Map as ImmutableMap } from 'immutable';
import createReducer from '../../createReducer';
import {
  CHANGE_EMAIL, CHANGE_NAME, CHANGE_PASSWORD, SUBMIT, SUBMIT_FAILURE,
  SUBMIT_SUCCESS
} from './actions';

export interface RegistrationState {
  name: string;
  email: string;
  password: string;
  isLoading: boolean;
  errors?: {
    name?: {};
    email?: {};
    password?: {};
    global?: {};
  };
}

export const initialState: RegistrationState = {
  name: '',
  email: '',
  password: '',
  isLoading: false,
  errors: undefined
};

export default createReducer({
  [CHANGE_NAME]: (state, action) => state.set('name', action.payload.name),
  [CHANGE_EMAIL]: (state, action) => state.set('email', action.payload.email),
  [CHANGE_PASSWORD]: (state, action) => state.set('password', action.payload.password),
  [SUBMIT]: (state, action) => state.merge({isLoading: true, errors: null}),
  [SUBMIT_SUCCESS]: (state, action) => state.set('isLoading', false),
  [SUBMIT_FAILURE]: (state, action) => state.merge({isLoading: false, errors: action.errors})
}, ImmutableMap(initialState));