import React from 'react';
import { useRouter } from 'next/router';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
    VALIDATION_LIMITS,
    DEFAULT_SIMULATION_SETTINGS
} from '../constants';
import { SimulationParams } from '../types';

interface SimulationSetupProps {
    onStartSimulation: (values: SimulationParams) => void;
}

const SimulationSchema = Yup.object().shape({
    grid_size: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.GRID_SIZE.min, `Must be at least ${VALIDATION_LIMITS.GRID_SIZE.min}`)
        .max(VALIDATION_LIMITS.GRID_SIZE.max, `Must be at most ${VALIDATION_LIMITS.GRID_SIZE.max}`),
    steps: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.STEPS.min, `Must be at least ${VALIDATION_LIMITS.STEPS.min}`)
        .max(VALIDATION_LIMITS.STEPS.max, `Must be at most ${VALIDATION_LIMITS.STEPS.max}`),
    neighborhood_type: Yup.string()
        .required('Required'),
    grid_type: Yup.string()
        .required('Required'),
    predator_death_probability: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREDATOR_DEATH_PROBABILITY.min, `Must be at least ${VALIDATION_LIMITS.PREDATOR_DEATH_PROBABILITY.min}`)
        .max(VALIDATION_LIMITS.PREDATOR_DEATH_PROBABILITY.max, `Must be at most ${VALIDATION_LIMITS.PREDATOR_DEATH_PROBABILITY.max}`),
    predator_birth_probability: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREDATOR_BIRTH_PROBABILITY.min, `Must be at least ${VALIDATION_LIMITS.PREDATOR_BIRTH_PROBABILITY.min}`)
        .max(VALIDATION_LIMITS.PREDATOR_BIRTH_PROBABILITY.max, `Must be at most ${VALIDATION_LIMITS.PREDATOR_BIRTH_PROBABILITY.max}`),
    initial_predators: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.INITIAL_PREDATORS.min, `Must be at least ${VALIDATION_LIMITS.INITIAL_PREDATORS.min}`)
        .max(VALIDATION_LIMITS.INITIAL_PREDATORS.max, `Must be at most ${VALIDATION_LIMITS.INITIAL_PREDATORS.max}`),
    predator_starvation_steps: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREDATOR_STARVATION_STEPS.min, `Must be at least ${VALIDATION_LIMITS.PREDATOR_STARVATION_STEPS.min}`)
        .max(VALIDATION_LIMITS.PREDATOR_STARVATION_STEPS.max, `Must be at most ${VALIDATION_LIMITS.PREDATOR_STARVATION_STEPS.max}`),
    prey_hunted_probability: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREY_HUNTED_PROBABILITY.min, `Must be at least ${VALIDATION_LIMITS.PREY_HUNTED_PROBABILITY.min}`)
        .max(VALIDATION_LIMITS.PREY_HUNTED_PROBABILITY.max, `Must be at most ${VALIDATION_LIMITS.PREY_HUNTED_PROBABILITY.max}`),
    prey_random_death: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREY_RANDOM_DEATH.min, `Must be at least ${VALIDATION_LIMITS.PREY_RANDOM_DEATH.min}`)
        .max(VALIDATION_LIMITS.PREY_RANDOM_DEATH.max, `Must be at most ${VALIDATION_LIMITS.PREY_RANDOM_DEATH.max}`),
    initial_prey: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.INITIAL_PREY.min, `Must be at least ${VALIDATION_LIMITS.INITIAL_PREY.min}`)
        .max(VALIDATION_LIMITS.INITIAL_PREY.max, `Must be at most ${VALIDATION_LIMITS.INITIAL_PREY.max}`),
    prey_birth_probability: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREY_BIRTH_PROBABILITY.min, `Must be at least ${VALIDATION_LIMITS.PREY_BIRTH_PROBABILITY.min}`)
        .max(VALIDATION_LIMITS.PREY_BIRTH_PROBABILITY.max, `Must be at most ${VALIDATION_LIMITS.PREY_BIRTH_PROBABILITY.max}`),
    prey_starvation_steps: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREY_STARVATION_STEPS.min, `Must be at least ${VALIDATION_LIMITS.PREY_STARVATION_STEPS.min}`)
        .max(VALIDATION_LIMITS.PREY_STARVATION_STEPS.max, `Must be at most ${VALIDATION_LIMITS.PREY_STARVATION_STEPS.max}`),
    prey_threat_response: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.PREY_THREAT_RESPONSE.min, `Must be at least ${VALIDATION_LIMITS.PREY_THREAT_RESPONSE.min}`)
        .max(VALIDATION_LIMITS.PREY_THREAT_RESPONSE.max, `Must be at most ${VALIDATION_LIMITS.PREY_THREAT_RESPONSE.max}`),
    initial_substrate_probability: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.INITIAL_SUBSTRATE_PROBABILITY.min, `Must be at least ${VALIDATION_LIMITS.INITIAL_SUBSTRATE_PROBABILITY.min}`)
        .max(VALIDATION_LIMITS.INITIAL_SUBSTRATE_PROBABILITY.max, `Must be at most ${VALIDATION_LIMITS.INITIAL_SUBSTRATE_PROBABILITY.max}`),
    substrate_random_death: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.SUBSTRATE_RANDOM_DEATH.min, `Must be at least ${VALIDATION_LIMITS.SUBSTRATE_RANDOM_DEATH.min}`)
        .max(VALIDATION_LIMITS.SUBSTRATE_RANDOM_DEATH.max, `Must be at most ${VALIDATION_LIMITS.SUBSTRATE_RANDOM_DEATH.max}`),
    substrate_consumption_prob: Yup.number()
        .required('Required')
        .min(VALIDATION_LIMITS.SUBSTRATE_CONSUMPTION_PROB.min, `Must be at least ${VALIDATION_LIMITS.SUBSTRATE_CONSUMPTION_PROB.min}`)
        .max(VALIDATION_LIMITS.SUBSTRATE_CONSUMPTION_PROB.max, `Must be at most ${VALIDATION_LIMITS.SUBSTRATE_CONSUMPTION_PROB.max}`),
});

export const SimulationSetup: React.FC<SimulationSetupProps> = ({ onStartSimulation }) => {
    const router = useRouter();

    return (
        <>
            <style jsx global>{`
                input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 8px;
                    border-radius: 4px;
                }
                
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #22c55e;
                    cursor: pointer;
                    border: none;
                }
                
                input[type="range"]::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #22c55e;
                    cursor: pointer;
                    border: none;
                }
                
                input[type="range"]:focus {
                    outline: none;
                }
                
                input[type="range"]:hover::-webkit-slider-thumb {
                    background: #16a34a;
                }
                
                input[type="range"]:hover::-moz-range-thumb {
                    background: #16a34a;
                }
            `}</style>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-6">Ecosystem Simulation Setup</h1>
            <div className="card p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-4">Configure Simulation</h2>

                <Formik
                    initialValues={DEFAULT_SIMULATION_SETTINGS}
                    validationSchema={SimulationSchema}
                    onSubmit={onStartSimulation}
                >
                    {({ values, isSubmitting }) => (
                        <Form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="grid_size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Grid Size: <span className="text-gray-500">{values.grid_size}×{values.grid_size}</span>
                                    </label>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Field
                                            type="range"
                                            name="grid_size"
                                            min={VALIDATION_LIMITS.GRID_SIZE.min}
                                            max={VALIDATION_LIMITS.GRID_SIZE.max}
                                            step="1"
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>{VALIDATION_LIMITS.GRID_SIZE.min}×{VALIDATION_LIMITS.GRID_SIZE.min}</span>
                                        <span>{VALIDATION_LIMITS.GRID_SIZE.max}×{VALIDATION_LIMITS.GRID_SIZE.max}</span>
                                    </div>
                                    <ErrorMessage name="grid_size" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Steps</label>
                                    <Field
                                        type="number"
                                        name="steps"
                                        min={VALIDATION_LIMITS.STEPS.min}
                                        max={VALIDATION_LIMITS.STEPS.max}
                                        className="input"
                                    />
                                    <ErrorMessage name="steps" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="neighborhood_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Neighborhood Type</label>
                                    <Field
                                        as="select"
                                        name="neighborhood_type"
                                        className="input"
                                    >
                                        <option value="von_neumann">Von Neumann (4 cells)</option>
                                        <option value="moore">Moore (8 cells)</option>
                                    </Field>
                                    <ErrorMessage name="neighborhood_type" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="grid_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grid Type</label>
                                    <Field
                                        as="select"
                                        name="grid_type"
                                        className="input"
                                    >
                                        <option value="finite">Finite</option>
                                        <option value="torus">Torus</option>
                                    </Field>
                                    <ErrorMessage name="grid_type" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div className="col-span-3 border-t pt-4 mt-2">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text mb-2">Predator Parameters</h3>
                                </div>

                                <div>
                                    <label htmlFor="initial_predators" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Predators</label>
                                    <Field
                                        type="number"
                                        name="initial_predators"
                                        min={VALIDATION_LIMITS.INITIAL_PREDATORS.min}
                                        max={VALIDATION_LIMITS.INITIAL_PREDATORS.max}
                                        className="input"
                                    />
                                    <ErrorMessage name="initial_predators" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="predator_death_probability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Death Probability</label>
                                    <Field
                                        type="number"
                                        name="predator_death_probability"
                                        step="0.01"
                                        min={VALIDATION_LIMITS.PREDATOR_DEATH_PROBABILITY.min}
                                        max={VALIDATION_LIMITS.PREDATOR_DEATH_PROBABILITY.max}
                                        className="input"
                                    />
                                    <ErrorMessage name="predator_death_probability" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="predator_birth_probability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Birth Probability</label>
                                    <Field
                                        type="number"
                                        name="predator_birth_probability"
                                        step="0.01"
                                        min={VALIDATION_LIMITS.PREDATOR_BIRTH_PROBABILITY.min}
                                        max={VALIDATION_LIMITS.PREDATOR_BIRTH_PROBABILITY.max}
                                        className="input"
                                    />
                                    <ErrorMessage name="predator_birth_probability" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="predator_starvation_steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Starvation Steps</label>
                                    <Field
                                        type="number"
                                        name="predator_starvation_steps"
                                        min={VALIDATION_LIMITS.PREDATOR_STARVATION_STEPS.min}
                                        max={VALIDATION_LIMITS.PREDATOR_STARVATION_STEPS.max}
                                        className="input"
                                    />
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Steps a predator can survive without food</div>
                                    <ErrorMessage name="predator_starvation_steps" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div className="col-span-3 border-t pt-4 mt-2">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text mb-2">Prey Parameters</h3>
                                </div>

                                <div>
                                    <label htmlFor="initial_prey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Prey</label>
                                    <Field
                                        type="number"
                                        name="initial_prey"
                                        min={VALIDATION_LIMITS.INITIAL_PREY.min}
                                        max={VALIDATION_LIMITS.INITIAL_PREY.max}
                                        className="input"
                                    />
                                    <ErrorMessage name="initial_prey" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="prey_hunted_probability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hunted Probability</label>
                                    <Field
                                        type="number"
                                        name="prey_hunted_probability"
                                        step="0.01"
                                        min={VALIDATION_LIMITS.PREY_HUNTED_PROBABILITY.min}
                                        max={VALIDATION_LIMITS.PREY_HUNTED_PROBABILITY.max}
                                        className="input"
                                    />
                                    <ErrorMessage name="prey_hunted_probability" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="prey_random_death" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Random Death Probability</label>
                                    <Field
                                        type="number"
                                        name="prey_random_death"
                                        step="0.01"
                                        min={VALIDATION_LIMITS.PREY_RANDOM_DEATH.min}
                                        max={VALIDATION_LIMITS.PREY_RANDOM_DEATH.max}
                                        className="input"
                                    />
                                    <ErrorMessage name="prey_random_death" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="prey_birth_probability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Birth Probability</label>
                                    <Field
                                        type="number"
                                        name="prey_birth_probability"
                                        step="0.01"
                                        min={VALIDATION_LIMITS.PREY_BIRTH_PROBABILITY.min}
                                        max={VALIDATION_LIMITS.PREY_BIRTH_PROBABILITY.max}
                                        className="input"
                                    />
                                    <ErrorMessage name="prey_birth_probability" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="prey_starvation_steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Starvation Steps</label>
                                    <Field
                                        type="number"
                                        name="prey_starvation_steps"
                                        min={VALIDATION_LIMITS.PREY_STARVATION_STEPS.min}
                                        max={VALIDATION_LIMITS.PREY_STARVATION_STEPS.max}
                                        className="input"
                                    />
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Steps a prey can survive without substrate</div>
                                    <ErrorMessage name="prey_starvation_steps" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="prey_threat_response" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threat Response</label>
                                    <Field
                                        type="number"
                                        name="prey_threat_response"
                                        step="0.01"
                                        min={VALIDATION_LIMITS.PREY_THREAT_RESPONSE.min}
                                        max={VALIDATION_LIMITS.PREY_THREAT_RESPONSE.max}
                                        className="input"
                                    />
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Probability of staying still when threatened</div>
                                    <ErrorMessage name="prey_threat_response" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div className="col-span-3 border-t pt-4 mt-2">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text mb-2">Substrate Parameters</h3>
                                </div>

                                <div>
                                    <label htmlFor="initial_substrate_probability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Probability</label>
                                    <Field
                                        type="number"
                                        name="initial_substrate_probability"
                                        step="0.01"
                                        min={VALIDATION_LIMITS.INITIAL_SUBSTRATE_PROBABILITY.min}
                                        max={VALIDATION_LIMITS.INITIAL_SUBSTRATE_PROBABILITY.max}
                                        className="input"
                                    />
                                    <ErrorMessage name="initial_substrate_probability" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="substrate_random_death" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Random Death Probability</label>
                                    <Field
                                        type="number"
                                        name="substrate_random_death"
                                        step="0.01"
                                        min={VALIDATION_LIMITS.SUBSTRATE_RANDOM_DEATH.min}
                                        max={VALIDATION_LIMITS.SUBSTRATE_RANDOM_DEATH.max}
                                        className="input"
                                    />
                                    <ErrorMessage name="substrate_random_death" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="substrate_consumption_prob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Consumption Probability</label>
                                    <Field
                                        type="number"
                                        name="substrate_consumption_prob"
                                        step="0.01"
                                        min={VALIDATION_LIMITS.SUBSTRATE_CONSUMPTION_PROB.min}
                                        max={VALIDATION_LIMITS.SUBSTRATE_CONSUMPTION_PROB.max}
                                        className="input"
                                    />
                                    <ErrorMessage name="substrate_consumption_prob" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            // Set loading state
                                            const btn = document.activeElement as HTMLButtonElement;
                                            if (btn) {
                                                btn.disabled = true;
                                                btn.textContent = 'Loading...';
                                            }

                                            // Navigate home
                                            await router.push('/');
                                        } catch (error) {
                                            console.error('Navigation error:', error);
                                            const btn = document.activeElement as HTMLButtonElement;
                                            if (btn) {
                                                btn.disabled = false;
                                                btn.textContent = 'Home';
                                            }
                                        }
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70"
                                >
                                    Home
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        window.location.reload();
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Reset to Defaults
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="min-w-[140px] bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Starting...' : 'Start Simulation'}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </>
    );
}; 