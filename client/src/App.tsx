import { Router, Route, Switch } from 'wouter';
import { AuthProvider } from './components/auth/AuthProvider';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Ideation from './pages/Ideation';
import Strategy from './pages/Strategy';
import Calendar from './pages/Calendar';
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
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/success" component={Success} />
          <Route path="/admin">
            <ProtectedRoute>
              <Layout>
                <Admin />
              </Layout>
            </ProtectedRoute>
          </Route>
          <Route>
            {(params) => (
              <ProtectedRoute>
                <Layout>
                  <Switch>
                    <Route path="/" component={Dashboard} />
                    <Route path="/ideation" component={Ideation} />
                    <Route path="/strategy" component={Strategy} />
                    <Route path="/calendar" component={Calendar} />
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