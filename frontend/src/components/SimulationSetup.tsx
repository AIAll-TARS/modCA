import React from 'react';
import { useRouter } from 'next/router';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
    VALIDATION_LIMITS,
    DEFAULT_SIMULATION_SETTINGS,
    getDefaultSettings,
    calculateScaledPopulation,
    calculateMaxPopulation,
    DEFAULT_GRID_SIZE,
    stepsToSliderValue,
    sliderValueToSteps,
    MIN_STEPS,
    MAX_STEPS
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

    // Helper function to format large numbers
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

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

                /* Add styles for steps slider */
                .steps-slider {
                    background: linear-gradient(to right, #1f2937 0%, #4b5563 50%, #6b7280 100%);
                }
                
                /* Update steps slider thumb color to match grid size */
                .steps-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #22c55e !important;
                    cursor: pointer;
                    border: none;
                }
                
                .steps-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #22c55e !important;
                    cursor: pointer;
                    border: none;
                }
                
                .steps-slider:hover::-webkit-slider-thumb {
                    background: #16a34a !important;
                }
                
                .steps-slider:hover::-moz-range-thumb {
                    background: #16a34a !important;
                }

                /* Radio toggle styles */
                .radio-toggle {
                    display: inline-flex;
                    position: relative;
                    padding: 4px;
                    background: #1f2937;
                    border-radius: 8px;
                    gap: 4px;
                }

                .radio-toggle label {
                    position: relative;
                    padding: 8px 12px;
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #9ca3af;
                    transition: all 0.2s;
                }

                .radio-toggle input[type="radio"] {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .radio-toggle input[type="radio"]:checked + label {
                    background: #374151;
                    color: white;
                }

                .radio-toggle .dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: currentColor;
                }

                .radio-toggle label:hover {
                    color: #d1d5db;
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
                    {({ values, setFieldValue, isSubmitting }) => {
                        // Handle grid size changes
                        const handleGridSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const newSize = parseInt(e.target.value);
                            const newSettings = getDefaultSettings(newSize);

                            // Update grid size
                            setFieldValue('grid_size', newSize);

                            // Update populations
                            setFieldValue('initial_predators', newSettings.initial_predators);
                            setFieldValue('initial_prey', newSettings.initial_prey);
                        };

                        // Handle steps slider change
                        const handleStepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = parseFloat(e.target.value);
                            const newSteps = sliderValueToSteps(value);
                            setFieldValue('steps', newSteps);
                        };

                        return (
                            <Form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Grid Size */}
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
                                                onChange={handleGridSizeChange}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{VALIDATION_LIMITS.GRID_SIZE.min}×{VALIDATION_LIMITS.GRID_SIZE.min}</span>
                                            <span>{VALIDATION_LIMITS.GRID_SIZE.max}×{VALIDATION_LIMITS.GRID_SIZE.max}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Population sizes will adjust automatically based on grid size
                                        </div>
                                        <ErrorMessage name="grid_size" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    {/* Steps */}
                                    <div>
                                        <label htmlFor="steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Steps: <span className="text-gray-500">{formatNumber(values.steps)}</span>
                                        </label>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Field
                                                type="range"
                                                name="steps"
                                                min={1}  // 10^1
                                                max={6}  // 10^6
                                                step="0.1"
                                                value={stepsToSliderValue(values.steps)}
                                                onChange={handleStepsChange}
                                                className="steps-slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{formatNumber(MIN_STEPS)}</span>
                                            <span>{formatNumber(MAX_STEPS)}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Logarithmic scale (10¹ - 10⁶)
                                        </div>
                                        <ErrorMessage name="steps" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    {/* Empty div to push grid settings to next row */}
                                    <div></div>

                                    {/* Grid Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grid Type</label>
                                        <div className="radio-toggle">
                                            <Field type="radio" name="grid_type" value="finite" id="finite" />
                                            <label htmlFor="finite">
                                                <span className="dot"></span>
                                                Finite
                                            </label>

                                            <Field type="radio" name="grid_type" value="torus" id="torus" />
                                            <label htmlFor="torus">
                                                <span className="dot"></span>
                                                Torus
                                            </label>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Finite has borders, Torus wraps around edges
                                        </div>
                                        <ErrorMessage name="grid_type" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    {/* Neighborhood Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Neighborhood Type</label>
                                        <div className="radio-toggle">
                                            <Field type="radio" name="neighborhood_type" value="von_neumann" id="von_neumann" />
                                            <label htmlFor="von_neumann">
                                                <span className="dot"></span>
                                                Von Neumann (4)
                                            </label>

                                            <Field type="radio" name="neighborhood_type" value="moore" id="moore" />
                                            <label htmlFor="moore">
                                                <span className="dot"></span>
                                                Moore (8)
                                            </label>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Select the number of neighboring cells to consider
                                        </div>
                                        <ErrorMessage name="neighborhood_type" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    {/* Empty div to maintain grid layout */}
                                    <div></div>

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
                        );
                    }}
                </Formik>
            </div>
        </>
    );
}; 