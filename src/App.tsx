import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  CentralPile,
  Player,
  GameSettings,
  GamePhase,
  CardLocation,
  ActionLog,
  SabotageRequest,
} from './types';
import {
  createDeck,
  initializePlayers,
  dealInitialCards,
  initCentralPiles,
  canPlayOnCentralPile,
  createActionLog,
} from './utils/gameEngine';
import { findBestAiMove, chooseAiDiscardIndex, chooseAiSabotageTarget } from './utils/aiEngine';
import { sound } from './utils/audio';
import { fetchAiCommentary, fetchCoachAdvice } from './utils/geminiApi';
import { trackMissionProgress } from './utils/dailyMissions';

import { Header } from './components/Header';
import { CentralBoard } from './components/CentralBoard';
import { PlayerMat } from './components/PlayerMat';
import { OpponentMat } from './components/OpponentMat';
import { BottomNavBar } from './components/BottomNavBar';
import { DraftWagerModal } from './components/DraftWagerModal';
import { SabotageTargetModal } from './components/SabotageTargetModal';
import { TutorialModal } from './components/TutorialModal';
import { SettingsModal } from './components/SettingsModal';
import { ActionLogFeed } from './components/ActionLog';
import { AiCommentaryPanel } from './components/AiCommentaryPanel';
import { GameOverModal } from './components/GameOverModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { RankingModal } from './components/RankingModal';
import { FlyingCardOverlay, FlyingCardData } from './components/FlyingCardOverlay';
import { LandscapeWarningOverlay } from './components/LandscapeWarningOverlay';
import { QuickEmojiBar, ActiveFlyingReaction, TeddyReaction, TEDDY_REACTIONS } from './components/QuickEmojiBar';
import { mpClient, GameRoom } from './utils/multiplayerClient';
import { SoloLevel, PlayerProgression } from './types';
import { getInitialProgression, recordMatchResult, MatchRewardResult } from './utils/rankingProgression';

export default function App() {
  // Game Settings State
  const [settings, setSettings] = useState<GameSettings>({
    startingStockpileSize: 20,
    turnTimerSeconds: 15,
    enableDraftPhase: true,
    enableUnderdogBounce: true,
    aiCount: 2,
    aiDifficulty: 'TACTICAL',
    enableSoundFX: true,
    gameMode: 'SINGLE_PLAYER',
  });

  // Main Core Game State
  const [gamePhase, setGamePhase] = useState<GamePhase>('DRAFT_WAGER');
  const [deck, setDeck] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [centralPiles, setCentralPiles] = useState<CentralPile[]>(initCentralPiles());
  const [underdogPlayers, setUnderdogPlayers] = useState<Set<string>>(new Set());

  // Turn Modifiers & Interactions
  const [turnTimer, setTurnTimer] = useState<number>(15);
  const [overdriveActive, setOverdriveActive] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<CardLocation | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Modals & Popups
  const [sabotageRequest, setSabotageRequest] = useState<SabotageRequest | null>(null);
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState<boolean>(false);
  const [showRankingModal, setShowRankingModal] = useState<boolean>(false);
  const [roundWinner, setRoundWinner] = useState<Player | null>(null);
  const [roundScoreGained, setRoundScoreGained] = useState<number>(0);
  const [blastRadiusPileIndex, setBlastRadiusPileIndex] = useState<number | null>(null);
  const [flyingCards, setFlyingCards] = useState<FlyingCardData[]>([]);
  const [cardsPlayedThisTurn, setCardsPlayedThisTurn] = useState<number>(0);

  // Ranking & Level Progression State
  const [progression, setProgression] = useState<PlayerProgression>(getInitialProgression);
  const [activeSoloLevelId, setActiveSoloLevelId] = useState<number | null>(null);
  const [matchReward, setMatchReward] = useState<MatchRewardResult | null>(null);
  const matchStartTimeRef = useRef<number>(Date.now());

  // Feed & AI Commentary
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [commentary, setCommentary] = useState<string>('Match initiated in the Overdrive Arena!');
  const [coachAdvice, setCoachAdvice] = useState<string>('Focus on clearing your Stockpile first!');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);

  const addLog = useCallback((text: string, type: ActionLog['type']) => {
    setActionLogs((prev) => [createActionLog(text, type), ...prev.slice(0, 25)]);
  }, []);

  const handleSelectSoloLevel = useCallback((level: SoloLevel) => {
    setSettings((s) => ({
      ...s,
      aiDifficulty: level.aiDifficulty,
      aiCount: level.aiCount,
      startingStockpileSize: level.stockpileSize,
      turnTimerSeconds: level.turnTimerSeconds,
      enableDraftPhase: level.enableDraft,
      gameMode: 'SOLO_CAMPAIGN',
    }));
    setActiveSoloLevelId(level.id);
    setShowRankingModal(false);
    addLog(`🎮 SOLO CAMPAIGN: Level ${level.id} - ${level.title} initiated!`, 'INFO');
  }, [addLog]);

  // Multiplayer Live Game Sync Effect
  useEffect(() => {
    const unsubMove = mpClient.on('game_move', (data) => {
      if (data?.gameState) {
        if (data.gameState.players) setPlayers(data.gameState.players);
        if (data.gameState.centralPiles) setCentralPiles(data.gameState.centralPiles);
        if (data.gameState.deck) setDeck(data.gameState.deck);
        if (data.gameState.activePlayerIndex !== undefined) setActivePlayerIndex(data.gameState.activePlayerIndex);
        if (data.gameState.overdriveActive !== undefined) setOverdriveActive(data.gameState.overdriveActive);
      }
      if (data?.actionLog) {
        addLog(data.actionLog, 'ACTION');
      }
    });

    return () => unsubMove();
  }, [addLog]);

  // Start Real Multiplayer Match
  const handleStartMultiplayerGame = useCallback(
    (room: GameRoom) => {
      const fullDeck = createDeck();
      const realPlayers: Player[] = room.players.map((rp, idx) => ({
        id: rp.id,
        name: rp.name,
        avatar: rp.avatar || (idx === 0 ? '🦊' : '🐉'),
        isAi: false,
        hand: [],
        stockpile: [],
        discards: [[], [], [], []],
        shieldTokens: 1,
        comboCount: 0,
        isVortexInverted: false,
        has6thHandSlot: false,
        score: 0,
        wins: 0,
      }));

      const { updatedDeck, updatedPlayers } = dealInitialCards(
        fullDeck,
        realPlayers,
        room.stockpileSize || 20
      );

      setDeck(updatedDeck);
      setPlayers(updatedPlayers);
      setCentralPiles(initCentralPiles());
      setActivePlayerIndex(0);
      setGamePhase('PLAYING');
      setTurnTimer(settings.turnTimerSeconds);
      setOverdriveActive(false);
      setSettings((s) => ({ ...s, gameMode: 'MULTIPLAYER' }));

      addLog(`🌐 Multiplayer match initiated with room #${room.code}!`, 'INFO');

      // Sync initial state to room
      mpClient.syncGameMove(
        {
          players: updatedPlayers,
          centralPiles: initCentralPiles(),
          deck: updatedDeck,
          activePlayerIndex: 0,
          overdriveActive: false,
        },
        `Room #${room.code} match started!`
      );
    },
    [settings.turnTimerSeconds, addLog]
  );

  const triggerCommentary = useCallback(
    async (event: string, playerName: string, details?: string) => {
      const text = await fetchAiCommentary(event, playerName, details);
      setCommentary(text);
    },
    []
  );

  // Draft Phase Pool
  const [draftCards, setDraftCards] = useState<Card[]>([]);

  // Active Flying Quick-Emoji Reactions
  const [activeFlyingReactions, setActiveFlyingReactions] = useState<ActiveFlyingReaction[]>([]);

  const handleSendReaction = useCallback(
    (reaction: TeddyReaction, targetPlayerId?: string) => {
      const sender = players[activePlayerIndex] || players[0];
      const target = targetPlayerId ? players.find((p) => p.id === targetPlayerId) : undefined;

      const newFlying: ActiveFlyingReaction = {
        id: `rx-${Date.now()}-${Math.random()}`,
        senderName: sender?.name || 'Player',
        senderAvatar: sender?.avatar || '🧸',
        targetName: target?.name,
        reaction,
        timestamp: Date.now(),
      };

      setActiveFlyingReactions((prev) => [...prev, newFlying]);

      addLog(`${sender?.name || 'Player'} ${reaction.speech}`, 'ACTION');

      if (settings.gameMode === 'MULTIPLAYER') {
        mpClient.syncGameMove(
          { activePlayerIndex },
          `${sender?.name || 'Player'} sent reaction: ${reaction.name}`
        );
      }

      if (settings.gameMode === 'SOLO' || settings.gameMode === 'CAMPAIGN') {
        const aiOpponents = players.filter((p) => p.isAi);
        if (aiOpponents.length > 0 && Math.random() < 0.65) {
          setTimeout(() => {
            const randomAi = aiOpponents[Math.floor(Math.random() * aiOpponents.length)];
            const randomRx = TEDDY_REACTIONS[Math.floor(Math.random() * TEDDY_REACTIONS.length)];

            sound.playEmojiReaction(randomRx.soundType);
            setActiveFlyingReactions((prev) => [
              ...prev,
              {
                id: `rx-ai-${Date.now()}-${Math.random()}`,
                senderName: randomAi.name,
                senderAvatar: randomAi.avatar,
                targetName: sender?.name,
                reaction: randomRx,
                timestamp: Date.now(),
              },
            ]);
            addLog(`${randomAi.name} ${randomRx.speech}`, 'ACTION');
          }, 900 + Math.random() * 800);
        }
      }

      setTimeout(() => {
        setActiveFlyingReactions((prev) => prev.filter((r) => r.id !== newFlying.id));
      }, 3200);
    },
    [players, activePlayerIndex, addLog, settings.gameMode]
  );

  // Sound Sync
  useEffect(() => {
    sound.enabled = settings.enableSoundFX;
  }, [settings.enableSoundFX]);

  // Start New Match Routine
  const startNewMatch = useCallback(() => {
    matchStartTimeRef.current = Date.now();
    const fullDeck = createDeck();
    const initP = initializePlayers(settings, underdogPlayers, progression.activeAvatar);

    if (settings.enableDraftPhase) {
      setDraftCards(fullDeck.slice(0, 10));
      setDeck(fullDeck.slice(10));
      setPlayers(initP);
      setCentralPiles(initCentralPiles());
      setGamePhase('DRAFT_WAGER');
    } else {
      const { updatedDeck, updatedPlayers } = dealInitialCards(
        fullDeck,
        initP,
        settings.startingStockpileSize
      );
      setDeck(updatedDeck);
      setPlayers(updatedPlayers);
      setCentralPiles(initCentralPiles());
      setActivePlayerIndex(0);
      setGamePhase('PLAYING');
      setTurnTimer(settings.turnTimerSeconds);
      setOverdriveActive(false);
      addLog('Match started! Fast-paced sequencing in progress.', 'INFO');
    }
  }, [settings, underdogPlayers, addLog]);

  useEffect(() => {
    startNewMatch();
  }, []);

  // Complete Pre-Match Draft
  const handleCompleteDraft = (
    selectedHandCards: Card[],
    chosenStockpileSize: number,
    opponentExtraStockpileCards: Card[] = []
  ) => {
    const { updatedDeck, updatedPlayers } = dealInitialCards(
      deck,
      players,
      chosenStockpileSize
    );

    // Give selected draft hand cards to Human player
    if (selectedHandCards.length > 0) {
      updatedPlayers[0].hand = [...selectedHandCards, ...updatedPlayers[0].hand].slice(0, 5);
    }

    // Add high draft cards to opponents' stockpiles if designated
    if (opponentExtraStockpileCards.length > 0) {
      updatedPlayers.forEach((p, idx) => {
        if (idx !== 0) {
          p.stockpile = [...opponentExtraStockpileCards, ...p.stockpile];
        }
      });
    }

    // Wager Mechanic: If player chose a smaller stockpile (<=15 cards), opponents get an extra Wild Card in hand!
    if (chosenStockpileSize <= 15) {
      updatedPlayers.forEach((p, idx) => {
        if (idx !== 0) {
          p.hand.unshift({
            id: `wager-wild-${Date.now()}-${idx}`,
            value: 'WILD',
            wildType: 'VORTEX',
          });
        }
      });
      addLog(`WAGER PERK: Small ${chosenStockpileSize}-card stockpile chosen! Opponents gained starting Wild cards!`, 'SABOTAGE');
    }

    setDeck(updatedDeck);
    setPlayers(updatedPlayers);
    setActivePlayerIndex(0);
    setGamePhase('PLAYING');
    setTurnTimer(settings.turnTimerSeconds);
    setOverdriveActive(false);
    sound.playDrawCard();
    addLog('5-Card Draft & Stockpile Wager complete! Match begins.', 'INFO');
  };

  // Turn End Transition Helper
  const advanceToNextTurn = useCallback(() => {
    setSelectedLocation(null);
    setSelectedCard(null);
    setOverdriveActive(false);

    setPlayers((prev) => {
      const nextIdx = (activePlayerIndex + 1) % prev.length;
      return prev.map((p, idx) => {
        // If active player had underdog bounce 6th hand slot and completed a successful turn with plays, consume it!
        if (idx === activePlayerIndex && p.has6thHandSlot && cardsPlayedThisTurn > 0) {
          addLog(`🏀 UNDERDOG BOUNCE: ${p.name} won their turn and consumed their 6th hand slot!`, 'INFO');
          return { ...p, has6thHandSlot: false };
        }
        if (idx === nextIdx) {
          // Refill Hand to 5 or 6 cards
          const targetHandSize = p.has6thHandSlot ? 6 : 5;
          const missingCount = targetHandSize - p.hand.length;
          let newHand = [...p.hand];
          if (missingCount > 0 && deck.length >= missingCount) {
            const drawn = deck.slice(0, missingCount);
            setDeck((d) => d.slice(missingCount));
            newHand = [...newHand, ...drawn];
            sound.playDrawCard();
          }
          return {
            ...p,
            hand: newHand,
            comboCount: 0,
            isVortexInverted: false, // Inversion wears off on turn start
          };
        }
        return p;
      });
    });

    setCardsPlayedThisTurn(0);
    const nextPlayerIndex = (activePlayerIndex + 1) % players.length;
    setActivePlayerIndex(nextPlayerIndex);
    setTurnTimer(settings.turnTimerSeconds);
    addLog(`Turn passes to ${players[nextPlayerIndex].name}.`, 'INFO');
  }, [activePlayerIndex, players, deck, cardsPlayedThisTurn, settings.turnTimerSeconds, addLog]);

  // Turn Speed Countdown Timer
  useEffect(() => {
    if (gamePhase !== 'PLAYING' || settings.turnTimerSeconds === 0) return;

    const interval = setInterval(() => {
      setTurnTimer((t) => {
        if (t <= 1) {
          // Timer Expired -> Penalty Discard and Pass Turn!
          sound.playTimerTick();
          const activeP = players[activePlayerIndex];
          if (activeP) {
            addLog(`SPEED PENALTY! ${activeP.name} timed out. Turn ended automatically.`, 'BURN');
            triggerCommentary('Speed Penalty Timeout', activeP.name);
          }
          advanceToNextTurn();
          return settings.turnTimerSeconds;
        }
        if (t <= 5) {
          sound.playTimerTick();
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gamePhase, settings.turnTimerSeconds, activePlayerIndex, players, advanceToNextTurn, addLog, triggerCommentary]);

  // Execute Player Move onto Central Pile
  const executePlayCard = (
    fromLocation: CardLocation,
    card: Card,
    toPileIndex: number
  ) => {
    const activePlayer = players[activePlayerIndex];
    if (!activePlayer) return;

    setCardsPlayedThisTurn((c) => c + 1);

    // Trigger Flying Card visual trajectory animation from player mat to central pile
    let sourceElemId = '';
    if (fromLocation.type === 'STOCKPILE') {
      sourceElemId = `player-${activePlayerIndex}-stockpile`;
    } else if (fromLocation.type === 'HAND' && typeof fromLocation.handIndex === 'number') {
      sourceElemId = `player-${activePlayerIndex}-hand-${fromLocation.handIndex}`;
    } else if (fromLocation.type === 'DISCARD' && typeof fromLocation.discardIndex === 'number') {
      sourceElemId = `player-${activePlayerIndex}-discard-${fromLocation.discardIndex}`;
    }

    const sourceElem = sourceElemId ? document.getElementById(sourceElemId) : null;
    const targetElem = document.getElementById(`central-pile-${toPileIndex}`);

    let startX = window.innerWidth / 2 - 30;
    let startY = activePlayerIndex === 0 ? window.innerHeight - 150 : 100;
    let endX = window.innerWidth / 2 - 30;
    let endY = window.innerHeight / 2 - 45;

    if (sourceElem) {
      const rect = sourceElem.getBoundingClientRect();
      startX = rect.left;
      startY = rect.top;
    }

    if (targetElem) {
      const rect = targetElem.getBoundingClientRect();
      endX = rect.left;
      endY = rect.top;
    }

    const isCombo = activePlayer.comboCount > 0;

    setFlyingCards((prev) => [
      ...prev,
      {
        id: `fly-${Date.now()}-${Math.random()}`,
        card,
        startX,
        startY,
        endX,
        endY,
        isCombo,
        comboCount: activePlayer.comboCount,
      },
    ]);

    // Remove Card from Source Location
    const updatedPlayers = [...players];
    const p = { ...updatedPlayers[activePlayerIndex] };

    if (fromLocation.type === 'STOCKPILE') {
      p.stockpile = p.stockpile.slice(1);
    } else if (fromLocation.type === 'HAND' && typeof fromLocation.handIndex === 'number') {
      p.hand = p.hand.filter((_, idx) => idx !== fromLocation.handIndex);
    } else if (fromLocation.type === 'DISCARD' && typeof fromLocation.discardIndex === 'number') {
      const slot = [...p.discards[fromLocation.discardIndex]];
      slot.pop();
      p.discards[fromLocation.discardIndex] = slot;
    }

    updatedPlayers[activePlayerIndex] = p;

    // Update Target Central Pile
    const updatedPiles = [...centralPiles];
    const pile = { ...updatedPiles[toPileIndex] };

    // Calculate New Top Value
    let newTopValue = 0;
    if (card.value === 'WILD') {
      newTopValue = pile.topValue === 12 ? 1 : pile.topValue + 1;
    } else {
      newTopValue = card.value as number;
    }

    // Check Spike Wild
    let isSpike = false;
    if (card.value === 'WILD' && card.wildType === 'SPIKE') {
      isSpike = true;
      pile.isSpikeLocked = true;
      pile.spikeLockedByPlayerName = p.name;
      sound.playSabotage();
      addLog(`${p.name} played a SPIKE WILD on Pile ${toPileIndex + 1}! Hand cards locked.`, 'SABOTAGE');
    }

    pile.cards = [...pile.cards, card];
    pile.topValue = newTopValue;

    // Check Blast Radius Explosion (12 played!)
    if (newTopValue === 12) {
      sound.playBlastRadius();
      setBlastRadiusPileIndex(toPileIndex);
      setTimeout(() => setBlastRadiusPileIndex(null), 800);

      // Reset Central Pile
      pile.cards = [];
      pile.topValue = 0;
      pile.isSpikeLocked = false;

      // Force all OTHER players to discard 1 random card from hand!
      updatedPlayers.forEach((otherP, pIdx) => {
        if (pIdx !== activePlayerIndex && otherP.hand.length > 0) {
          const randIdx = Math.floor(Math.random() * otherP.hand.length);
          otherP.hand = otherP.hand.filter((_, i) => i !== randIdx);
        }
      });

      addLog(`💥 BLAST RADIUS! ${p.name} completed Pile ${toPileIndex + 1} with a 12! Opponents forced to discard.`, 'BLAST');
      triggerCommentary('Blast Radius Explosion', p.name);
    } else {
      sound.playCardPlace();
      addLog(`${p.name} played ${card.value === 'WILD' ? card.wildType + ' WILD' : card.value} on Pile ${toPileIndex + 1}.`, 'PLAY');
    }

    updatedPiles[toPileIndex] = pile;
    setCentralPiles(updatedPiles);

    // Check Aspect Wild Trigger (Vortex / Heist)
    if (card.value === 'WILD' && card.wildType === 'VORTEX') {
      if (p.isAi) {
        // AI chooses target
        const targetIdx = chooseAiSabotageTarget(updatedPlayers, activePlayerIndex);
        executeSabotageTarget('VORTEX', activePlayerIndex, targetIdx, updatedPlayers);
      } else {
        setSabotageRequest({ type: 'VORTEX', sourcePlayerIndex: activePlayerIndex, cardPlayed: card });
      }
    } else if (card.value === 'WILD' && card.wildType === 'HEIST') {
      if (p.isAi) {
        const targetIdx = chooseAiSabotageTarget(updatedPlayers, activePlayerIndex);
        executeSabotageTarget('HEIST', activePlayerIndex, targetIdx, updatedPlayers);
      } else {
        setSabotageRequest({ type: 'HEIST', sourcePlayerIndex: activePlayerIndex, cardPlayed: card });
      }
    }

    // Check Stockpile Clearance Victory!
    if (p.stockpile.length === 0) {
      setPlayers(updatedPlayers);
      handleRoundVictory(p, updatedPlayers);
      return;
    }

    // Daily Mission Tracking for Human Player
    if (activePlayerIndex === 0) {
      if (card.value === 'WILD') {
        const { updatedProg, newlyCompleted } = trackMissionProgress(progression, 'PLAY_WILDS', 1);
        setProgression(updatedProg);
        newlyCompleted.forEach((m) => {
          addLog(`🏆 DAILY MISSION COMPLETED: "${m.title}"! Claim in Ranks menu.`, 'INFO');
          sound.playVictory();
        });
      }
      if (fromLocation.type === 'STOCKPILE') {
        const { updatedProg, newlyCompleted } = trackMissionProgress(progression, 'CLEAR_STOCKPILE', 1);
        setProgression(updatedProg);
        newlyCompleted.forEach((m) => {
          addLog(`🏆 DAILY MISSION COMPLETED: "${m.title}"! Claim in Ranks menu.`, 'INFO');
          sound.playVictory();
        });
      }
      if (card.value === 'WILD' && (card.wildType === 'VORTEX' || card.wildType === 'SPIKE' || card.wildType === 'HEIST')) {
        const { updatedProg, newlyCompleted } = trackMissionProgress(progression, 'USE_SABOTAGE', 1);
        setProgression(updatedProg);
        newlyCompleted.forEach((m) => {
          addLog(`🏆 DAILY MISSION COMPLETED: "${m.title}"! Claim in Ranks menu.`, 'INFO');
          sound.playVictory();
        });
      }
    }

    // Check Empty Hand -> Refill & Chain Reaction Combo!
    if (p.hand.length === 0) {
      const newComboCount = p.comboCount + 1;
      p.comboCount = newComboCount;

      if (activePlayerIndex === 0) {
        const { updatedProg, newlyCompleted } = trackMissionProgress(progression, 'TRIGGER_COMBOS', 1);
        setProgression(updatedProg);
        newlyCompleted.forEach((m) => {
          addLog(`🏆 DAILY MISSION COMPLETED: "${m.title}"! Claim in Ranks menu.`, 'INFO');
          sound.playVictory();
        });
      }

      // Draw fresh hand
      const drawSize = p.has6thHandSlot ? 6 : 5;
      if (deck.length >= drawSize) {
        p.hand = deck.slice(0, drawSize);
        setDeck((d) => d.slice(drawSize));
      }

      sound.playCombo(newComboCount);
      addLog(`⚡ CHAIN REACTION! ${p.name} cleared hand! COMBO x${newComboCount} activated!`, 'COMBO');
      triggerCommentary(`Chain Reaction Combo x${newComboCount}`, p.name);

      if (newComboCount === 2) {
        // Combo x2: Stockpile Burn!
        if (p.isAi) {
          const targetIdx = chooseAiSabotageTarget(updatedPlayers, activePlayerIndex);
          executeSabotageTarget('BURN', activePlayerIndex, targetIdx, updatedPlayers);
        } else {
          setSabotageRequest({ type: 'BURN', sourcePlayerIndex: activePlayerIndex });
        }
      } else if (newComboCount >= 3) {
        // Combo x3: Overdrive Descending Play Active!
        setOverdriveActive(true);
        addLog(`🚀 OVERDRIVE STATE! ${p.name} can now play DESCENDING sequences on central piles!`, 'COMBO');
      }
    }

    setPlayers(updatedPlayers);
    setSelectedLocation(null);
    setSelectedCard(null);

    if (settings.gameMode === 'MULTIPLAYER') {
      mpClient.syncGameMove({
        players: updatedPlayers,
        centralPiles: updatedPiles,
        deck,
        activePlayerIndex,
        overdriveActive,
      });
    }
  };

  // Execute Sabotage Action (VORTEX, HEIST, BURN)
  const executeSabotageTarget = (
    type: 'VORTEX' | 'HEIST' | 'BURN',
    sourcePlayerIndex: number,
    targetPlayerIndex: number,
    currentPlayers: Player[]
  ) => {
    const updated = [...currentPlayers];
    const source = updated[sourcePlayerIndex];
    const target = updated[targetPlayerIndex];

    // Check Shield Protection
    if (target.shieldTokens > 0) {
      target.shieldTokens -= 1;
      sound.playShieldBlock();
      addLog(`🛡️ SHIELD BLOCK! ${target.name}'s Shield Token blocked ${source.name}'s ${type} attack!`, 'SHIELD');
      setSabotageRequest(null);
      setPlayers(updated);
      return;
    }

    sound.playSabotage();

    if (type === 'VORTEX') {
      target.isVortexInverted = true;
      addLog(`🌀 VORTEX! ${source.name} forced ${target.name}'s hand face-out visible to all!`, 'SABOTAGE');
    } else if (type === 'HEIST') {
      // Swap top discard cards
      let sourceDiscardTop: Card | null = null;
      let targetDiscardTop: Card | null = null;
      let sourceSlotIdx = -1;
      let targetSlotIdx = -1;

      for (let i = 0; i < source.discards.length; i++) {
        if (source.discards[i].length > 0) {
          sourceDiscardTop = source.discards[i][source.discards[i].length - 1];
          sourceSlotIdx = i;
          break;
        }
      }

      for (let i = 0; i < target.discards.length; i++) {
        if (target.discards[i].length > 0) {
          targetDiscardTop = target.discards[i][target.discards[i].length - 1];
          targetSlotIdx = i;
          break;
        }
      }

      if (sourceDiscardTop && targetDiscardTop && sourceSlotIdx !== -1 && targetSlotIdx !== -1) {
        source.discards[sourceSlotIdx].pop();
        target.discards[targetSlotIdx].pop();
        source.discards[sourceSlotIdx].push(targetDiscardTop);
        target.discards[targetSlotIdx].push(sourceDiscardTop);
        addLog(`🚨 HEIST! ${source.name} swapped discard tops with ${target.name}!`, 'SABOTAGE');
      }
    } else if (type === 'BURN') {
      // Burn top card of opponent's stockpile
      if (target.stockpile.length > 0) {
        const burned = target.stockpile.shift();
        if (burned) {
          setDeck((d) => [...d, burned]); // Put at bottom of deck
        }
        addLog(`🔥 STOCKPILE BURN! ${source.name} burned ${target.name}'s top stockpile card!`, 'BURN');
      }
    }

    setSabotageRequest(null);
    setPlayers(updated);
  };

  // Discard 1 Card to End Turn
  const executeDiscardToEndTurn = (discardSlotIndex: number) => {
    if (!selectedLocation || selectedLocation.type !== 'HAND' || typeof selectedLocation.handIndex !== 'number') return;

    const updated = [...players];
    const p = { ...updated[activePlayerIndex] };
    const cardToDiscard = p.hand[selectedLocation.handIndex];

    if (!cardToDiscard) return;

    // Remove from Hand
    p.hand = p.hand.filter((_, idx) => idx !== selectedLocation.handIndex);

    // Check Shield Token Match (e.g., 5 on top of a 5)
    const slot = [...p.discards[discardSlotIndex]];
    let earnedShield = false;

    if (slot.length > 0) {
      const topCard = slot[slot.length - 1];
      if (
        cardToDiscard.value !== 'WILD' &&
        topCard.value !== 'WILD' &&
        cardToDiscard.value === topCard.value
      ) {
        p.shieldTokens += 1;
        earnedShield = true;
        sound.playShieldBlock();
        addLog(`🛡️ SHIELD EARNED! ${p.name} stacked matching ${cardToDiscard.value} for +1 Shield Token!`, 'SHIELD');
      }
    }

    slot.push(cardToDiscard);
    p.discards[discardSlotIndex] = slot;
    updated[activePlayerIndex] = p;

    sound.playCardPlace();
    if (!earnedShield) {
      addLog(`${p.name} discarded into slot ${discardSlotIndex + 1} and ended turn.`, 'PLAY');
    }

    setPlayers(updated);
    if (settings.gameMode === 'MULTIPLAYER') {
      mpClient.syncGameMove({
        players: updated,
        centralPiles,
        deck,
        activePlayerIndex: (activePlayerIndex + 1) % updated.length,
        overdriveActive: false,
      });
    }
    advanceToNextTurn();
  };

  // Round Victory Handler
  const handleRoundVictory = (winner: Player, currentPlayers: Player[]) => {
    sound.playVictory();
    setRoundWinner(winner);

    // Calculate Points
    let remainingStockCards = 0;
    const nextUnderdogSet = new Set<string>();

    currentPlayers.forEach((p) => {
      if (p.id !== winner.id) {
        remainingStockCards += p.stockpile.length;
        if (p.stockpile.length > 15) {
          nextUnderdogSet.add(p.id);
        }
      }
    });

    const totalRoundScore = 25 + remainingStockCards * 5;
    setRoundScoreGained(totalRoundScore);
    setUnderdogPlayers(nextUnderdogSet);

    // Record Rank Points (RP) & Level Progression
    const isHumanWinner = winner.id === currentPlayers[0]?.id;
    const durationSeconds = Math.max(5, Math.floor((Date.now() - matchStartTimeRef.current) / 1000));
    const activeLevel = progression.soloLevels.find((l) => l.id === activeSoloLevelId);
    const levelTitle = settings.gameMode === 'SOLO_CAMPAIGN' ? activeLevel?.title : undefined;

    const reward = recordMatchResult(
      progression,
      isHumanWinner,
      settings.gameMode === 'MULTIPLAYER',
      activeSoloLevelId || undefined,
      {
        winner,
        allPlayers: currentPlayers,
        durationSeconds,
        totalScore: totalRoundScore,
        gameMode: settings.gameMode,
        levelTitle,
      }
    );

    const { updatedProg: p1 } = trackMissionProgress(reward.updatedProgression, 'PLAY_MATCHES', 1);
    let finalProg = p1;
    if (isHumanWinner) {
      const { updatedProg: p2 } = trackMissionProgress(p1, 'WIN_MATCHES', 1);
      finalProg = p2;
    }

    setProgression(finalProg);
    setMatchReward({ ...reward, updatedProgression: finalProg });

    // Update Player Scores
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === winner.id) {
          return { ...p, score: p.score + totalRoundScore, wins: p.wins + 1 };
        }
        return p;
      })
    );

    setGamePhase('ROUND_OVER');
    addLog(
      `🏆 ROUND OVER! ${winner.name} wins +${totalRoundScore} pts! (${reward.rpGained >= 0 ? '+' : ''}${reward.rpGained} RP, +${reward.xpGained} XP)`,
      'INFO'
    );
    triggerCommentary('Round Victory', winner.name, `Scored +${totalRoundScore} victory points!`);
  };

  // AI Turn Automated Execution Loop
  useEffect(() => {
    if (gamePhase !== 'PLAYING') return;

    const activeP = players[activePlayerIndex];
    if (!activeP || !activeP.isAi) return;

    const timer = setTimeout(() => {
      // Find best move for AI
      const move = findBestAiMove(activeP, activePlayerIndex, centralPiles, overdriveActive);

      if (move) {
        executePlayCard(move.from, move.card, move.toPileIndex);
      } else {
        // Discard & End Turn
        const { handIndex, discardSlotIndex } = chooseAiDiscardIndex(activeP);
        if (activeP.hand.length > 0) {
          setSelectedLocation({ type: 'HAND', playerIndex: activePlayerIndex, handIndex });
          executeDiscardToEndTurn(discardSlotIndex);
        } else {
          advanceToNextTurn();
        }
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [gamePhase, activePlayerIndex, players, centralPiles, overdriveActive]);

  // Click Handler for Selecting Cards on Player Mat
  const handleSelectCard = (location: CardLocation, card: Card) => {
    if (location.playerIndex !== activePlayerIndex) return;

    if (
      selectedLocation &&
      selectedLocation.type === location.type &&
      selectedLocation.handIndex === location.handIndex &&
      selectedLocation.discardIndex === location.discardIndex
    ) {
      // Deselect
      setSelectedLocation(null);
      setSelectedCard(null);
      return;
    }

    setSelectedLocation(location);
    setSelectedCard(card);
    sound.playCardPlace();
  };

  // Click Handler for Target Central Pile
  const handlePileClick = (pileIndex: number) => {
    if (!selectedCard || !selectedLocation) return;

    const pile = centralPiles[pileIndex];
    if (canPlayOnCentralPile(selectedCard, pile, selectedLocation.type, overdriveActive)) {
      executePlayCard(selectedLocation, selectedCard, pileIndex);
    } else {
      addLog('Invalid move! Card does not fit this sequence.', 'INFO');
    }
  };

  // Fetch Coach Advice Request
  const handleGetCoachAdvice = async () => {
    setIsLoadingAdvice(true);
    const humanP = players[0];
    const topStock = humanP?.stockpile[0]?.value ?? null;
    const advice = await fetchCoachAdvice({
      hand: humanP?.hand.map((c) => c.value) || [],
      stockpileTop: topStock,
      centralPiles: centralPiles.map((p) => p.topValue),
      opponentStockpiles: players.slice(1).map((p) => p.stockpile.length),
    });
    setCoachAdvice(advice);
    setIsLoadingAdvice(false);
  };

  const activePlayer = players[activePlayerIndex];

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full bg-teddy-brawl text-slate-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Cartoon Pop Teddy Header Bar */}
      <div className="w-full h-7 bg-black border-b-2 border-yellow-400 shadow-[0_2px_0_#000] flex items-center justify-between px-3 shrink-0 z-40">
        <div className="flex items-center gap-2 text-[10px] font-black italic text-yellow-300 uppercase tracking-widest drop-shadow-[0_1px_0_#000]">
          <span>🧸 TEDDY BRAWL ARENA</span>
          <span className="hidden sm:inline text-cyan-400 font-bold">• OVERDRIVE CARD LEAGUE</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Top Gear Icon */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex h-5 w-5 items-center justify-center rounded-lg border-2 border-black bg-yellow-400 text-slate-950 shadow-[1px_1px_0_#000] hover:scale-105 cursor-pointer text-[10px] font-black"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* App Header for Timers & Actions */}
      <div className="shrink-0">
        <Header
          turnTimer={turnTimer}
          maxTimerSeconds={settings.turnTimerSeconds}
          isCurrentPlayerHuman={activePlayer ? !activePlayer.isAi : true}
          activePlayerName={activePlayer ? activePlayer.name : 'Ready'}
          players={players}
          activePlayerIndex={activePlayerIndex}
          onOpenTutorial={() => setShowTutorialModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenMultiplayer={() => setShowMultiplayerModal(true)}
          onOpenRanking={() => setShowRankingModal(true)}
          progression={progression}
          onToggleSound={() => setSettings((s) => ({ ...s, enableSoundFX: !s.enableSoundFX }))}
          soundEnabled={settings.enableSoundFX}
        />
      </div>

      {/* Main Living Room Mobile Play Area */}
      <main className="relative flex-1 min-h-0 mx-auto max-w-md w-full px-2 py-1 flex flex-col justify-between overflow-hidden gap-1 sm:gap-1.5">
        {/* Announcer & Coach Banner */}
        <div className="shrink-0">
          <AiCommentaryPanel
            commentary={commentary}
            coachAdvice={coachAdvice}
            onRequestAdvice={handleGetCoachAdvice}
            isLoadingAdvice={isLoadingAdvice}
          />
        </div>

        {/* TOP LAYER: Opponents Side-by-Side */}
        {players.length > 1 && (
          <div className="grid grid-cols-2 gap-1.5 w-full shrink-0">
            {players.slice(1).map((opp, oppIdx) => {
              const actualPlayerIndex = oppIdx + 1;
              return (
                <OpponentMat
                  key={opp.id}
                  player={opp}
                  playerIndex={actualPlayerIndex}
                  isCurrentTurn={actualPlayerIndex === activePlayerIndex}
                  selectedLocation={selectedLocation}
                  onSelectCard={handleSelectCard}
                />
              );
            })}
          </div>
        )}

        {/* CENTER LAYER: Card Table Surface & Central Build Piles Shelf */}
        <div className="relative w-full rounded-3xl border-4 border-black bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 p-1.5 shadow-[5px_5px_0_#000] shrink-0">
          {/* Card Table Felt Surface Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-black/50 pointer-events-none rounded-2xl" />

          {/* Central Build Piles Board */}
          <CentralBoard
            centralPiles={centralPiles}
            onPileClick={handlePileClick}
            selectedCard={selectedCard}
            overdriveActive={overdriveActive}
            blastRadiusPileIndex={blastRadiusPileIndex}
            drawDeckCount={deck.length}
          />
        </div>

        {/* BOTTOM LAYER: Human Player Coffee Table & Hand */}
        {players[0] && (
          <div className="shrink-0">
            <PlayerMat
              player={players[0]}
              playerIndex={0}
              isCurrentTurn={activePlayerIndex === 0}
              selectedLocation={selectedLocation}
              onSelectCard={handleSelectCard}
              onSelectDiscardSlot={(slotIdx) => executeDiscardToEndTurn(slotIdx)}
              canDiscardToEndTurn={
                selectedLocation?.type === 'HAND' && activePlayerIndex === 0
              }
              isHumanPlayer={true}
              blastRadiusActive={blastRadiusPileIndex !== null}
              onDropCardToPile={(location, card, pileIndex) => {
                const pile = centralPiles[pileIndex];
                if (canPlayOnCentralPile(card, pile, location.type, overdriveActive)) {
                  executePlayCard(location, card, pileIndex);
                } else {
                  sound.playTimerTick();
                  addLog('Invalid move! Card does not fit this sequence.', 'INFO');
                }
              }}
            />
          </div>
        )}

        {/* Action Feed Ticker */}
        <div className="shrink-0">
          <ActionLogFeed logs={actionLogs} />
        </div>
      </main>

      {/* Draft & Wager Modal */}
      {gamePhase === 'DRAFT_WAGER' && (
        <DraftWagerModal
          draftCards={draftCards}
          onCompleteDraft={handleCompleteDraft}
          defaultStockpileSize={settings.startingStockpileSize}
        />
      )}

      {/* Sabotage Target Selection Modal */}
      {sabotageRequest && (
        <SabotageTargetModal
          request={sabotageRequest}
          players={players}
          onSelectTarget={(targetIdx) =>
            executeSabotageTarget(
              sabotageRequest.type,
              sabotageRequest.sourcePlayerIndex,
              targetIdx,
              players
            )
          }
        />
      )}

      {/* Interactive Tutorial Rulebook */}
      {showTutorialModal && <TutorialModal onClose={() => setShowTutorialModal(false)} />}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newS) => setSettings(newS)}
          onClose={() => setShowSettingsModal(false)}
          onResetGame={startNewMatch}
        />
      )}

      {/* Victory Modal */}
      {gamePhase === 'ROUND_OVER' && roundWinner && (
        <GameOverModal
          winner={roundWinner}
          players={players}
          roundScoreGained={roundScoreGained}
          underdogPlayersNextRound={Array.from(underdogPlayers)}
          matchReward={matchReward}
          onNextRound={startNewMatch}
          onNewMatch={() => {
            setUnderdogPlayers(new Set());
            startNewMatch();
          }}
        />
      )}
      {/* Online Chat & Multiplayer Modal */}
      <MultiplayerModal
        isOpen={showMultiplayerModal}
        onClose={() => setShowMultiplayerModal(false)}
        onStartMultiplayerGame={handleStartMultiplayerGame}
        progression={progression}
      />

      {/* Solo Campaign & Global Ranking Modal */}
      <RankingModal
        isOpen={showRankingModal}
        onClose={() => setShowRankingModal(false)}
        progression={progression}
        onSelectSoloLevel={handleSelectSoloLevel}
        onUpdateTitle={(newTitle) => setProgression((p) => ({ ...p, activeTitle: newTitle }))}
        onUpdateProgression={(newProg) => setProgression(newProg)}
      />

      {/* Card Journey Flying Transition Animation Layer */}
      <FlyingCardOverlay
        flyingCards={flyingCards}
        onCardAnimationComplete={(id) =>
          setFlyingCards((prev) => prev.filter((c) => c.id !== id))
        }
      />

      {/* Quick-Emoji Cartoon Teddy Reaction System */}
      {gamePhase === 'PLAYING' && (
        <QuickEmojiBar
          players={players}
          activePlayerIndex={activePlayerIndex}
          onSendReaction={handleSendReaction}
          activeFlyingReactions={activeFlyingReactions}
        />
      )}

      {/* Bottom Mobile Game Navigation Bar */}
      <BottomNavBar
        onOpenTutorial={() => setShowTutorialModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenMultiplayer={() => setShowMultiplayerModal(true)}
        onOpenRanking={() => setShowRankingModal(true)}
        onRequestAdvice={async () => {
          if (activePlayerIndex === 0 && players[0]) {
            const advice = await fetchCoachAdvice({
              hand: players[0].hand.map((c) => c.value),
              stockpileTop: players[0].stockpile[0]?.value ?? null,
              centralPiles: centralPiles.map((p) => p.topValue),
              opponentStockpiles: players.slice(1).map((p) => p.stockpile.length),
            });
            alert(`💡 COACH ADVICE: ${advice}`);
          }
        }}
      />

      {/* Device Orientation Landscape Warning Overlay */}
      <LandscapeWarningOverlay />
    </div>
  );
}
