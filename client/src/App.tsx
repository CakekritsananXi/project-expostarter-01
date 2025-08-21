import { Router, Route, Switch } from 'wouter';
import { AuthProvider } from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Ideation from './pages/Ideation';
import Strategy from './pages/Strategy';
import Library from './pages/Library';
import Analytics from './pages/Analytics';
import Collaboration from './pages/Collaboration';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Pricing from './pages/Pricing';
import Success from './pages/Success';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          {/* Public routes */}
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/success" component={Success} />
          <Route path="/admin">
            {() => (
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            )}
          </Route>

          {/* Protected routes */}
          <Route path="/:rest*">
            {(params) => (
              <ProtectedRoute>
                <Layout>
                  <Switch>
                    <Route path="/" component={Dashboard} />
                    <Route path="/calendar" component={Calendar} />
                    <Route path="/ideation" component={Ideation} />
                    <Route path="/strategy" component={Strategy} />
                    <Route path="/library" component={Library} />
                    <Route path="/analytics" component={Analytics} />
                    <Route path="/collaboration" component={Collaboration} />
                  </Switch>
                </Layout>
              </ProtectedRoute>
            )}
          </Route>
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;