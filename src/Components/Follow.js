import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useUser } from "../context/userContext";
import { IoCheckmarkCircleSharp, IoCheckmarkCircle, IoClose } from 'react-icons/io5';
import { CiNoWaitingSign } from 'react-icons/ci';
import { formatNumber } from '../utils/functions';
import { useNavigate } from 'react-router-dom';
import { AsyncCompiler } from 'sass';


const Follow = () => {
    const [showVerifyButtons, setShowVerifyButtons] = useState({});
    const [countdowns, setCountdowns] = useState({});
    const [buttonText, setButtonText] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [claiming, setClaiming] = useState({});
    const [submittedYt, setSubmittedYt] = useState({});
    const { id: userId, followTasks, setTaskPoints, userFollowTasks, setUserFollowTasks, setBalance } = useUser();
    const [claimedBonus, setClaimedBonus] = useState(0);
    const [congrats, setCongrats] = useState(false);
    const [openTask, setOpenTask] = useState(null);
    const [active, setActive] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleBackButtonClick = () => {
            setOpenTask(false);
        };

        if (openTask) {
            window.Telegram.WebApp.BackButton.show();
            window.Telegram.WebApp.BackButton.onClick(handleBackButtonClick);
        } else {
            window.Telegram.WebApp.BackButton.hide();
            window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
        }

        return () => {
            window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
        };
    }, [openTask]);
    const saveTaskToUser = async (taskId) => {
        try {
            const userDocRef = doc(db, 'telegramUsers', userId);
            const updateduserFollowTasks = [...userFollowTasks, { taskId: taskId, completed: false }];
            await updateDoc(userDocRef, {
                followTasks: arrayUnion({ taskId: taskId, completed: false })
            });
            setUserFollowTasks(updateduserFollowTasks); // Update state to reflect the saved task
            console.log(`Task ${taskId} added to user's followTasks collection`);
        } catch (error) {
            console.error("Error adding task to user's document: ", error);
        }
    };

    const updateUserDoc = async () => {
        try {
            const userDocRef = doc(db, 'telegramUsers', userId);
            await updateDoc(userDocRef, {
                followTasks: userFollowTasks.map(item => item),
            });
            console.log("userFollowTasks: ", userFollowTasks);
        } catch (error) {
            console.error("Error updating task status to completed: ", error);
        }
        
    }
    useEffect(() => {
        updateUserDoc()
        // eslint-disable-next-line
    }, [userFollowTasks]);

    const claimTask = async (taskId) => {
        setClaiming(prevState => ({ ...prevState, [taskId]: true }));
        
        try {
            const task = followTasks.find(task => task.id === taskId);
            window.open(task.link, '_blank');
            const userDocRef = doc(db, 'telegramUsers', userId);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();
            if(!userFollowTasks.find(task => task.taskId === taskId))
                saveTaskToUser(taskId);
            
            console.log("follow: ", userData.followTasks);
            await updateDoc(userDocRef, {
                // followTasks: userFollowTasks.map(task =>
                //     task.taskId === taskId ? { ...task, completed: true } : task
                // ),
                balance: increment(task.bonus),
                taskPoints: increment(task.bonus),
            });
            setBalance(prevBalance => prevBalance + task.bonus);
            setTaskPoints(prevTaskPoints => prevTaskPoints + task.bonus);
            console.log(`Task ${taskId} marked as completed`);
            setUserFollowTasks(prevTasks =>
                prevTasks.map(task =>
                    task.taskId === taskId ? { ...task, completed: true } : task
                )
            );

            setModalMessage(
                <>
                    <div className="w-full flex justify-center flex-col items-center space-y-3">
                        <div className="w-full items-center justify-center flex flex-col space-y-2">
                            <IoCheckmarkCircleSharp size={32} className="text-btn4" />
                            <p className='font-medium text-center'>Let's go!!</p>
                        </div>
                        <h3 className="font-medium text-[20px] text-[#ffffff] pt-2 pb-2">
                            <span className="text-btn4">+{formatNumber(task.bonus)}</span> ${process.env.REACT_APP_PROJECT_SYMBOL} CLAIMED
                        </h3>
                        <p className="pb-6 text-[15px] w-full text-center">
                            Keep performing new tasks! something huge is coming! Perform more and earn more ${process.env.REACT_APP_PROJECT_SYMBOL} now!
                        </p>
                    </div>
                    <div className="w-full flex justify-center">
                        <button
                            onClick={closeModal}
                            className={`bg-btn4 text-[#000]  w-full py-3 px-3 flex items-center justify-center text-center rounded-[12px] font-semibold text-[16px]`}
                        >
                            Continue tasks
                        </button>
                    </div>
                </>
            );
            setModalOpen(true);
            setClaimedBonus(task.bonus);
            setCongrats(true);

            setTimeout(() => {
                setCongrats(false);
            }, 4000);
        } catch (error) {
            console.error("Error updating task status to completed: ", error);
        }
        setClaiming(prevState => ({ ...prevState, [taskId]: false }));
    };

    const closeModal = () => {
        setModalOpen(false);
        setOpenTask(false);
    };

    const closeModal2 = () => {
        setModalOpen(false);
        setActive(false);
    };

    useEffect(() => {
        const submittedStatesYt = followTasks.reduce((acc, task) => {
            const submittedStateYt = localStorage.getItem(`submittedYt_${task.id}`) === 'true';
            acc[task.id] = submittedStateYt;
            return acc;
        }, {});
        setSubmittedYt(submittedStatesYt);
        // eslint-disable-next-line
    }, []);

    return (
        <>
            {followTasks
                .sort((a, b) => a.id - b.id)
                .map(task => {
                    const userTask = userFollowTasks.find(t => t.taskId === task.id);
                    const isTaskCompleted = userTask ? userTask.completed : false;
                    return (
                        <div key={task.id}
                            // onClick={() => setOpenTask(task)}
                            className="w-full rounded-[16px] py-3 flex items-center justify-between space-x-1">

                            <div className='w-fit pr-2'>
                                <div className='flex items-center justify-center bg-[#1f2023] h-[45px] w-[45px] rounded-full p-1'>
                                    <img alt="engy" src={task.icon} className='w-[30px] rounded-full' />
                                </div>
                            </div>
                            <div className="flex h-full flex-1 flex-col justify-center relative">
                                <div className='flex w-full flex-col justify-between h-full space-y-1'>
                                    <h1 className="text-[15px] text-nowrap line-clamp-1 font-medium">
                                        {task.title}
                                    </h1>
                                    <span className='flex text-secondary items-center w-fit text-[15px]'>

                                        <span className=''>
                                            +{formatNumber(task.bonus)} ${process.env.REACT_APP_PROJECT_SYMBOL}
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div className='w-fit flex items-center justify-end flex-wrap text-[14px] relative'>

                                {isTaskCompleted ? (
                                    <>
                                        <span className=''>
                                            <IoCheckmarkCircleSharp size={28} className={`text-accent`} />
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => claimTask(task.id)}
                                            className={`bg-[#1f2023] hover:bg-[#36373c] text-[#fff] w-fit py-[10px] rounded-[30px] px-5 font-semibold ease-in duration-200`}
                                        >
                                            Join
                                        </button>
                                        {/* <a
                                            href={task.link}
                                            className={`bg-[#1f2023] hover:bg-[#36373c] text-[#fff] w-fit py-[10px] rounded-[30px] px-5 font-semibold ease-in duration-200`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            >
                                            Join
                                        </a> */}
                                        {/* <button
                                                    onClick={() => setOpenTask(task)}
                                                    className="w-fit py-[6px] px-4 font-medium bg-[#383838] text-[#888] ease-in duration-200 rounded-[6px]"
                                                >
                                                    Pending
                                                </button> */}
                                    </>
                                )}


                            </div>
                        </div>

                    );
                })}
            
            <div className='w-full absolute top-[50px] left-0 right-0 flex justify-center z-[60] pointer-events-none select-none'>
                {congrats ? (<img src='/congrats.gif' alt="congrats" className="w-[80%]" />) : (<></>)}
            </div>
            <div
                className={`${modalOpen ? "visible" : "invisible"} fixed top-[-12px] bottom-0 left-0 z-50 right-0 h-[100vh] bg-[#00000042] flex justify-center items-center backdrop-blur-[6px] px-4`}
            >
                <div className={`${modalOpen ? "opacity-100 mt-0 ease-in duration-300" : "opacity-0 mt-[100px]"} w-full bg-modal relative rounded-[16px] flex flex-col justify-center p-8`}>
                    {modalMessage}
                </div>
            </div>
        </>
    );
};


export default Follow;
