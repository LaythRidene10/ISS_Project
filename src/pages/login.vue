<template>
  <div>
    <v-container
      class="d-flex align-center justify-center fill-height"
      max-width="480"
    >
      <v-card variant="outlined" width="100%">
        <v-card-title class="text-h5 font-weight-bold px-6 pt-6 pb-0">
          <v-icon class="me-2">mdi-steering</v-icon>
          Identify Yourself
        </v-card-title>

        <v-tabs v-model="tab" class="px-4 pt-3" color="primary">
          <v-tab value="login">Sign In</v-tab>
          <v-tab value="register">Create Account</v-tab>
        </v-tabs>

        <v-divider />

        <v-card-text class="pa-6">
          <v-window v-model="tab">
            <v-window-item value="login">
              <v-text-field
                v-model="loginForm.email"
                class="mb-3"
                density="compact"
                :error-messages="loginErrors.email"
                label="Email Address"
                prepend-inner-icon="mdi-email-outline"
                type="email"
                variant="outlined"
                @input="clearLoginErrors"
              />
              <v-text-field
                v-model="loginForm.password"
                :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
                class="mb-3"
                density="compact"
                :error-messages="loginErrors.password"
                label="Password"
                prepend-inner-icon="mdi-lock-outline"
                :type="showPass ? 'text' : 'password'"
                variant="outlined"
                @click:append-inner="showPass = !showPass"
                @input="clearLoginErrors"
              />
              <v-select
                v-model="loginForm.type"
                class="mb-3"
                density="compact"
                :items="roleOptions"
                item-title="label"
                item-value="value"
                label="Login As"
                prepend-inner-icon="mdi-account-switch-outline"
                variant="outlined"
                @update:model-value="clearLoginErrors"
              />
              <div class="d-flex justify-space-between align-center mb-5">
                <v-checkbox
                  v-model="rememberMe"
                  density="compact"
                  hide-details
                  label="Remember me"
                />
                <v-btn class="text-none" size="small" variant="text">
                  Forgot password?
                </v-btn>
              </div>

              <v-btn
                block
                color="primary"
                :loading="loading"
                variant="elevated"
                @click="handleLogin"
              >
                Sign In
              </v-btn>

              <div class="mt-4 text-center">
                <div class="text-caption text-medium-emphasis mb-2">Demo Credentials:</div>
                <div class="text-caption font-weight-bold">admin@kartbuilder.com / admin123</div>
                <div class="text-caption font-weight-bold">supplier@kartparts.com / supplier123</div>
              </div>

              <v-alert
                v-if="error"
                class="mt-3"
                density="compact"
                type="error"
                variant="tonal"
              >
                {{ error }}
              </v-alert>
            </v-window-item>

            <v-window-item value="register">
              <p class="text-body-2 text-medium-emphasis mb-4">
                Enter your details to create a user or supplier account.
              </p>
              <v-text-field
                v-model="registerForm.firstName"
                class="mb-3"
                density="compact"
                :error-messages="registerErrors.firstName"
                label="First Name"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                @input="clearRegisterErrors"
              />
              <v-text-field
                v-model="registerForm.email"
                class="mb-3"
                density="compact"
                :error-messages="registerErrors.email"
                label="Your Email"
                prepend-inner-icon="mdi-email-outline"
                type="email"
                variant="outlined"
                @input="clearRegisterErrors"
              />
              <v-text-field
                v-model="registerForm.password"
                :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
                class="mb-3"
                density="compact"
                :error-messages="registerErrors.password"
                label="Your Password"
                prepend-inner-icon="mdi-lock-outline"
                :type="showPass ? 'text' : 'password'"
                variant="outlined"
                @click:append-inner="showPass = !showPass"
                @input="clearRegisterErrors"
              />
              <v-text-field
                v-model="registerForm.confirmPassword"
                class="mb-3"
                density="compact"
                :error-messages="registerErrors.confirmPassword"
                label="Confirm Your Password"
                prepend-inner-icon="mdi-lock-check-outline"
                :type="showPass ? 'text' : 'password'"
                variant="outlined"
                @input="clearRegisterErrors"
              />
              <v-select
                v-model="registerForm.type"
                class="mb-5"
                density="compact"
                :items="registerRoleOptions"
                item-title="label"
                item-value="value"
                label="Account Type"
                prepend-inner-icon="mdi-badge-account-outline"
                variant="outlined"
                @update:model-value="clearRegisterErrors"
              />
              <v-btn
                block
                :loading="loading"
                variant="outlined"
                @click="handleRegister"
              >
                Create Account
              </v-btn>

              <v-alert
                v-if="error"
                class="mt-3"
                density="compact"
                type="error"
                variant="tonal"
              >
                {{ error }}
              </v-alert>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { addSupplier, getSupplierByEmail, Supplier } from '@/datamodel/supplier'
  import { addUser, getUserByEmail, getUserByEmailAndPassword, User as UserClass } from '@/datamodel/user'
  import { useAppStore } from '@/stores/app'

  const router = useRouter()
  const store = useAppStore()

  const roleOptions = [
    { label: 'User', value: 'user' },
    { label: 'Supplier', value: 'supplier' },
    { label: 'Admin', value: 'admin' },
  ]

  const registerRoleOptions = roleOptions.filter(option => option.value !== 'admin')

  const tab = ref('login')
  const loading = ref(false)
  const error = ref('')
  const showPass = ref(false)
  const rememberMe = ref(false)

  const loginForm = ref({ email: '', password: '', type: 'user' })
  const registerForm = ref({
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'user',
  })

  const loginErrors = ref({ email: '', password: '' })
  const registerErrors = ref({ firstName: '', email: '', password: '', confirmPassword: '' })

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  function validateEmail (email) {
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  function validatePassword (password) {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
    return ''
  }

  function validateFirstName (name) {
    if (!name || !name.trim()) return 'First name is required'
    if (name.trim().length < 2) return 'First name must be at least 2 characters'
    return ''
  }

  function clearLoginErrors () {
    loginErrors.value = { email: '', password: '' }
    error.value = ''
  }

  function clearRegisterErrors () {
    registerErrors.value = { firstName: '', email: '', password: '', confirmPassword: '' }
    error.value = ''
  }

  function getRedirectPath (userType) {
    if (userType === 'admin') return '/admin'
    if (userType === 'supplier') return '/supplier-panel'
    return '/'
  }

  function handleLogin () {
    clearLoginErrors()

    loginErrors.value.email = validateEmail(loginForm.value.email)
    loginErrors.value.password = loginForm.value.password ? '' : 'Password is required'

    if (loginErrors.value.email || loginErrors.value.password) {
      return
    }

    loading.value = true
    setTimeout(() => {
      const found = getUserByEmailAndPassword(
        loginForm.value.email.trim(),
        loginForm.value.password,
      )

      if (found && found.type === loginForm.value.type) {
        store.login(found, rememberMe.value)
        router.push(getRedirectPath(found.type))
      } else if (found) {
        error.value = `This account is registered as ${found.type}. Please choose the correct role.`
      } else {
        error.value = 'Invalid email or password.'
      }

      loading.value = false
    }, 400)
  }

  function handleRegister () {
    clearRegisterErrors()

    registerErrors.value.firstName = validateFirstName(registerForm.value.firstName)
    registerErrors.value.email = validateEmail(registerForm.value.email)
    registerErrors.value.password = validatePassword(registerForm.value.password)

    if (!registerErrors.value.email && getUserByEmail(registerForm.value.email.trim())) {
      registerErrors.value.email = 'An account with this email already exists'
    }

    if (registerForm.value.confirmPassword !== registerForm.value.password) {
      registerErrors.value.confirmPassword = 'Passwords do not match'
    } else if (!registerForm.value.confirmPassword) {
      registerErrors.value.confirmPassword = 'Please confirm your password'
    }

    if (Object.values(registerErrors.value).some(Boolean)) {
      return
    }

    loading.value = true
    setTimeout(() => {
      const newUser = new UserClass({
        first_name: registerForm.value.firstName.trim(),
        last_name: '',
        email: registerForm.value.email.trim(),
        password: registerForm.value.password,
        type: registerForm.value.type,
      })

      addUser(newUser)

      if (newUser.type === 'supplier' && !getSupplierByEmail(newUser.email)) {
        addSupplier(new Supplier({
          name: `${newUser.first_name} Supplies`,
          email: newUser.email,
          certified: false,
        }))
      }

      store.login(newUser, rememberMe.value)
      registerForm.value = {
        firstName: '',
        email: '',
        password: '',
        confirmPassword: '',
        type: 'user',
      }

      router.push(getRedirectPath(newUser.type))
      loading.value = false
    }, 400)
  }
</script>
