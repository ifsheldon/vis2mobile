Read @README.md and @AGENTS.md . Follow the requirements in these documents and help me convert @cost-desktop.html into a mobile friendly version.

When converting a desktop visualization to a mobile visualization, you should follow the steps below carefully:

1. Read README.md first.
2. Check source code of an svg or html file and **its rendered visualization by opening a browser tab** first. Make sure the browser window is **in desktop ratio**. Understand the full details in the visualization and the appearance of it. You should take note all information presented in the desktop version.
3. Read @mobile-vis-design-action-space.md   which details the design space of visualizations and action space of what actions you can take to convert the visualization into a mobile friendly one.
4. Based on your understanding of the visualization and the design and action spaces, give your reasoning and plan about how to transform the visualization into a mobile friendly one. Like what steps and actions to take.
    - Just give a plan, no need to implement the mobile version yet. You should give **the actions to take that are in the action space and tell why you choose that action**.
    - If there's an action that is not in the action space, tell the reason as well as the justification of why existing actions are not suitable.
    - You should analyse the desktop visualization, **think about the actions in the space and write the high-level plan first and then implmentation details in a seperate section.**
    - The mobile version should **preserve as much information and intention presented in the desktop version as possible.** If due to mobile constraints, some information must be omitted or presented in another view, you should mention it in the plan and write your justification.
5. Pause and seek feedback from the user about the plan. Proceed to implement the mobile version if the user says so.
6. When you finish implementing the mobile version, check it in the browser **with mobile aspect ratio** and see if it's mobile friendly. Check common issues like text truncation etc.
7. Check readability issues and issues like the rendering does not match your plan. If there are any, go back to code and fix them. Only when all careful checks are passed, can you proceed to the next step.
8. Make it another example in the gallery. The button for the original visualization should open the svg file or the html file. **Check the visualization in gallery.** When you check the gallery website, make sure you rescale the browser window to **desktop aspect ratio**. Place the new example as the first one in the gallery.

HARD REQUIREMENT: **Think about how to ensure readability on mobile screen. DO NOT just copy the layout of the desktop visualization. Double check readability when you finish your implementation. Failing to ensure readability will directly lead to task failure**.
