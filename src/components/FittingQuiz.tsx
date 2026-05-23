/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { getFittingRecommendation } from "../constants";
import { BallModel, BallColor } from "../types";
import BallVisual from "./BallVisual";

interface FittingQuizProps {
  onAddBall: (model: BallModel, color: BallColor, qty: number, customNum: number, notes: string) => void;
}

export default function FittingQuiz({ onAddBall }: FittingQuizProps) {
  const [step, setStep] = useState<1 | 2 | 3 | "result">(1);
  const [distance, setDistance] = useState<string>("medium"); // short, medium, long
  const [priority, setPriority] = useState<string>("feel"); // spin, feel, distance
  const [finish, setFinish] = useState<string>("any"); // gloss, matte, drip, any

  const handleRestart = () => {
    setStep(1);
    setDistance("medium");
    setPriority("feel");
    setFinish("any");
  };

  const recommendation = getFittingRecommendation(distance, priority, finish);

  // Suggest a default color for the recommended ball
  const getDefaultColorForModel = (model: BallModel): BallColor => {
    switch (model) {
      case BallModel.PRO_PLUS:
        return finish === "drip" ? BallColor.DRIP_RED_BLUE : BallColor.WHITE;
      case BallModel.PRO:
        return finish === "drip" ? BallColor.DRIP_LIME : BallColor.WHITE;
      case BallModel.PRO_SOFT:
        return finish === "drip" ? BallColor.DRIP_YELLOW : BallColor.NEON_LIME;
      case BallModel.TOUR:
        return BallColor.WHITE;
      case BallModel.DRIVE:
      default:
        return BallColor.NEON_LIME;
    }
  };

  const recommendedColor = getDefaultColorForModel(recommendation.model);

  const handleAddRecommended = (qty: number) => {
    const notes = `Fitted via Golf Ball Vault Assistant. Distance: ${
      distance === "long" ? ">250 yds" : distance === "medium" ? "220-250 yds" : "<220 yds"
    }, Highlight: ${priority.toUpperCase()}`;
    
    onAddBall(recommendation.model, recommendedColor, qty, 1, notes);
    alert(`Added ${qty} ${recommendation.model} (${recommendedColor}) to your collection! ⛳️`);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl text-neutral-100 h-full flex flex-col justify-between" id="fitting-quiz-container">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
            <h3 className="font-sans font-extrabold tracking-tight text-lg text-white">
              VICE BALL FITTING LAB
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {step === "result" ? "MATCH FOUND" : `STEP ${step} OF 3`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-lime-400 h-1 transition-all duration-300"
            style={{ 
              width: step === 1 ? "33%" : step === 2 ? "66%" : step === 3 ? "90%" : "100%" 
            }}
          />
        </div>

        {/* Step 1: Average Driving Yardage */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="text-base font-semibold text-white">How far do you typically drive the ball?</h4>
            <p className="text-xs text-neutral-400">Your driver distance directly correlates with your clubhead swing speed, influencing core compression choice:</p>
            
            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                id="distance-short"
                onClick={() => { setDistance("short"); setStep(2); }}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  distance === "short" 
                    ? "border-lime-400 bg-lime-950/20 text-white" 
                    : "border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-300"
                }`}
              >
                <span className="text-sm font-bold text-white">Smooth / Moderate Swing</span>
                <span className="text-xs text-neutral-400 mt-1">Under 220 Yards (Swing Speed &lt; 95 mph)</span>
              </button>

              <button
                id="distance-medium"
                onClick={() => { setDistance("medium"); setStep(2); }}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  distance === "medium" 
                    ? "border-lime-400 bg-lime-950/20 text-white" 
                    : "border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-300"
                }`}
              >
                <span className="text-sm font-bold text-white">Powerful / Standard Swing</span>
                <span className="text-xs text-neutral-400 mt-1">220 - 250 Yards (Swing Speed 95 - 110 mph)</span>
              </button>

              <button
                id="distance-long"
                onClick={() => { setDistance("long"); setStep(2); }}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  distance === "long" 
                    ? "border-lime-400 bg-lime-950/20 text-white" 
                    : "border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-300"
                }`}
              >
                <span className="text-sm font-bold text-white">Fast / Aggressive Swing</span>
                <span className="text-xs text-neutral-400 mt-1">Over 250 Yards (Swing Speed &gt; 110 mph)</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Playstyle Core Priority */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="text-base font-semibold text-white">What do you prioritize most in a golf ball?</h4>
            <p className="text-xs text-neutral-400">Urethane balls excel in greenside control, while Surlyn balls prioritize bulletproof straight flights and ultimate value.</p>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                id="priority-spin"
                onClick={() => { setPriority("spin"); setStep(3); }}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  priority === "spin" 
                    ? "border-lime-400 bg-lime-950/20 text-white" 
                    : "border-neutral-800 hover:border-border text-neutral-300 bg-neutral-950"
                }`}
              >
                <span className="text-sm font-bold text-white">Maximum Wedge Spin & Control</span>
                <span className="text-xs text-neutral-400 mt-1">Wants ultimate backspin on approach shots for drop-and-stop power.</span>
              </button>

              <button
                id="priority-feel"
                onClick={() => { setPriority("feel"); setStep(3); }}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  priority === "feel" 
                    ? "border-lime-400 bg-lime-950/20 text-white" 
                    : "border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-300"
                }`}
              >
                <span className="text-sm font-bold text-white">Buttery Soft Feel</span>
                <span className="text-xs text-neutral-400 mt-1">Sensory, click-free response on puts and soft greenside chips.</span>
              </button>

              <button
                id="priority-distance"
                onClick={() => { setPriority("distance"); setStep(3); }}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  priority === "distance" 
                    ? "border-lime-400 bg-lime-950/20 text-white" 
                    : "border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-300"
                }`}
              >
                <span className="text-sm font-bold text-white">Pure Straight Distance & Durability</span>
                <span className="text-xs text-neutral-400 mt-1">Low side spin to keep tee sheets straight with a cover built to last.</span>
              </button>
            </div>

            <div className="flex justify-between pt-2">
              <button
                id="back-step-1"
                onClick={() => setStep(1)}
                className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded bg-neutral-800"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Visual Cover Aesthetics */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="text-base font-semibold text-white">What cover aesthetics call your name?</h4>
            <p className="text-xs text-neutral-400">Vice Golf is world-famous for its colorful designs and splatters. What fits your eye?</p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                id="finish-gloss"
                onClick={() => { setFinish("gloss"); setStep("result"); }}
                className="p-3 text-center rounded-xl border text-xs font-bold transition-all bg-neutral-950 border-neutral-800 hover:border-neutral-600"
              >
                💎 Traditional Gloss
              </button>

              <button
                id="finish-matte"
                onClick={() => { setFinish("matte"); setStep("result"); }}
                className="p-3 text-center rounded-xl border text-xs font-bold transition-all bg-neutral-950 border-neutral-800 hover:border-neutral-600"
              >
                🕶 Matte Vivids
              </button>

              <button
                id="finish-drip"
                onClick={() => { setFinish("drip"); setStep("result"); }}
                className="p-3 text-center rounded-xl border text-xs font-bold transition-all col-span-2 bg-gradient-to-r from-teal-900/30 to-red-950/30 border-neutral-800 hover:border-lime-400 text-lime-300"
              >
                🎨 Famous VICE Drip (Splatters)
              </button>
            </div>

            <div className="flex justify-between pt-4">
              <button
                id="back-step-2"
                onClick={() => setStep(2)}
                className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded bg-neutral-800"
              >
                ← Back
              </button>
              <button
                id="skip-finish"
                onClick={() => { setFinish("any"); setStep("result"); }}
                className="text-xs text-lime-400 hover:underline px-3 py-1.5"
              >
                I don't care, find best performance →
              </button>
            </div>
          </div>
        )}

        {/* Results Page */}
        {step === "result" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-shrink-0 flex flex-col items-center">
                <BallVisual 
                  color={recommendedColor} 
                  model={recommendation.model} 
                  number={77}
                  size="lg" 
                  className="mb-2"
                />
                <span className="text-[10px] font-mono font-bold text-lime-400 tracking-wider">
                  MATCH DECLARED
                </span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] font-mono bg-lime-400 text-black px-2 py-0.5 rounded font-bold uppercase">
                  {recommendation.specs.cover}
                </span>
                <h4 className="text-lg font-black tracking-tight text-white mt-1 leading-tight">
                  {recommendation.title}
                </h4>
                <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                  {recommendation.reason}
                </p>
              </div>
            </div>

            {/* Performance Spec-Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-[11px]">
              <div>
                <span className="text-neutral-500 block">Feel</span>
                <span className="text-white font-semibold">{recommendation.specs.feel}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Compression</span>
                <span className="text-white font-semibold">{recommendation.specs.compression}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Layers</span>
                <span className="text-white font-semibold">{recommendation.specs.layers}-layers</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Target Speed</span>
                <span className="text-white font-semibold">{recommendation.specs.swingSpeed}</span>
              </div>
            </div>

            {/* Add directly controls */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-mono text-neutral-400 block text-center">Add fitted balls directly to bag:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="add-sleeve"
                  onClick={() => handleAddRecommended(3)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold p-2.5 rounded-xl text-xs transition"
                >
                  ⛳️ Add 1 Sleeve (3 Balls)
                </button>
                <button
                  id="add-dozen"
                  onClick={() => handleAddRecommended(12)}
                  className="bg-lime-400 hover:bg-lime-300 text-black font-black p-2.5 rounded-xl text-xs transition"
                >
                  📦 Add Dozen (12 Balls)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {step === "result" && (
        <div className="pt-4 border-t border-neutral-800 text-center">
          <button
            id="restart-fitting"
            onClick={handleRestart}
            className="text-xs text-neutral-400 hover:text-white font-mono"
          >
            🔄 Retake Fitting Assessment
          </button>
        </div>
      )}
    </div>
  );
}
