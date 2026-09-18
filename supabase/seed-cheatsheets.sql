-- =============================================================================
-- Interview Prep — Cheatsheet Seed Data (technologies + categories)
-- Idempotent: safe to re-run. Upserted by slug, so re-running this script
-- updates existing content in place instead of creating duplicates.
-- Run this AFTER schema.sql. Run supabase/seed-cheatsheets-items.sql AFTER this.
-- =============================================================================

-- =============================================================================
-- Technologies
-- =============================================================================
insert into public.cheatsheet_technologies (name, slug, description, icon, display_order)
values
  ('JavaScript', 'javascript', 'Quick-reference JavaScript array/string/object methods, loops, ES6+ features, operators, functions and async patterns.', 'file-code-2', 1),
  ('HTML', 'html', 'Quick-reference HTML tags, attributes, forms and semantic elements.', 'file-code', 2),
  ('CSS', 'css', 'Quick-reference CSS selectors, properties, Flexbox, Grid, positioning, responsive design and animations.', 'palette', 3),
  ('React', 'react', 'Quick-reference React components, props, state, hooks, events, context and common APIs.', 'atom', 4),
  ('Redux', 'redux', 'Quick-reference Redux store, actions, reducers, slices, selectors, Redux Toolkit and async integration.', 'layers', 5),
  ('Zustand', 'zustand', 'Quick-reference Zustand store, state, actions, selectors and async integration.', 'box', 6),
  ('DOM', 'dom', 'Quick-reference DOM selection, element manipulation, events, attributes, classes and traversal.', 'mouse-pointer-click', 7)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  display_order = excluded.display_order;

-- =============================================================================
-- Categories
-- =============================================================================
insert into public.cheatsheet_categories (technology_id, name, slug, description, display_order)
select t.id, v.name, v.slug, v.description, v.display_order
from (values
  ('javascript', 'Array Methods', 'array-methods', 'Common methods for creating, transforming and inspecting arrays.', 1),
  ('javascript', 'String Methods', 'string-methods', 'Common methods for working with strings.', 2),
  ('javascript', 'Object Methods', 'object-methods', 'Common Object.* static and instance methods.', 3),
  ('javascript', 'Loops', 'loops', 'Iteration constructs and their differences.', 4),
  ('javascript', 'ES6+ Features', 'es6-plus', 'Modern JavaScript syntax and language features.', 5),
  ('javascript', 'Variables & Data Types', 'variables-data-types', 'Declaring variables and the core JavaScript data types.', 6),
  ('javascript', 'Operators', 'operators', 'Arithmetic, comparison, logical and other operators.', 7),
  ('javascript', 'Functions', 'functions', 'Function declarations, expressions and related concepts.', 8),
  ('javascript', 'Promises & Async/Await', 'promises-async-await', 'Asynchronous JavaScript patterns and APIs.', 9),
  ('javascript', 'Other Common Methods', 'other-methods', 'Frequently used JSON, Math, Number, console and timer APIs.', 10),

  ('html', 'HTML Tags', 'tags', 'The most important HTML elements.', 1),
  ('html', 'Common Attributes', 'attributes', 'Attributes used across many HTML elements.', 2),
  ('html', 'Forms & Inputs', 'forms-inputs', 'Form elements, input types and related attributes.', 3),
  ('html', 'Semantic Tags', 'semantic-tags', 'Elements that describe the meaning of page structure.', 4),

  ('css', 'Selectors', 'selectors', 'Ways to target elements with CSS.', 1),
  ('css', 'Properties', 'properties', 'Frequently used CSS properties.', 2),
  ('css', 'Flexbox', 'flexbox', 'Flexbox container and item properties.', 3),
  ('css', 'Grid', 'grid', 'CSS Grid container and item properties.', 4),
  ('css', 'Position', 'position', 'The position property and its values.', 5),
  ('css', 'Responsive Design', 'responsive-design', 'Media queries, units and mobile-first techniques.', 6),
  ('css', 'Animations & Transitions', 'animations', 'Transitions, keyframe animations and transforms.', 7),
  ('css', 'Other Common Features', 'other-features', 'Variables, functions and other frequently used CSS features.', 8),

  ('react', 'Components', 'components', 'Core concepts for building React components.', 1),
  ('react', 'Props', 'props', 'Passing and using props.', 2),
  ('react', 'State', 'state', 'Managing component state.', 3),
  ('react', 'Hooks', 'hooks', 'Built-in React hooks.', 4),
  ('react', 'Events', 'events', 'Handling events in React.', 5),
  ('react', 'Context', 'context', 'Sharing data with the Context API.', 6),
  ('react', 'Common React APIs', 'common-apis', 'Frequently used top-level React APIs.', 7),

  ('redux', 'Store', 'store', 'Creating and configuring the Redux store.', 1),
  ('redux', 'Actions', 'actions', 'Action objects and action creators.', 2),
  ('redux', 'Reducers', 'reducers', 'Writing and combining reducers.', 3),
  ('redux', 'Slices', 'slices', 'Redux Toolkit slices.', 4),
  ('redux', 'Selectors', 'selectors', 'Reading state from the store.', 5),
  ('redux', 'Redux Toolkit', 'redux-toolkit', 'Core Redux Toolkit APIs.', 6),
  ('redux', 'API/Async Integration', 'async-integration', 'Handling async logic and API calls.', 7),

  ('zustand', 'Store', 'store', 'Creating a Zustand store.', 1),
  ('zustand', 'State', 'state', 'Reading and updating state.', 2),
  ('zustand', 'Actions', 'actions', 'Defining actions on the store.', 3),
  ('zustand', 'Selectors', 'selectors', 'Selecting slices of state efficiently.', 4),
  ('zustand', 'API/Async Integration', 'async-integration', 'Async actions and middleware.', 5),

  ('dom', 'Selection Methods', 'selection', 'Selecting elements from the document.', 1),
  ('dom', 'Element Manipulation', 'manipulation', 'Creating, modifying and removing elements.', 2),
  ('dom', 'Events', 'events', 'Listening for and handling DOM events.', 3),
  ('dom', 'Attributes', 'attributes', 'Reading and writing element attributes.', 4),
  ('dom', 'Classes', 'classes', 'Working with an element''s classList.', 5),
  ('dom', 'DOM Traversal', 'traversal', 'Navigating between related nodes.', 6),
  ('dom', 'Common DOM APIs', 'common-apis', 'Other frequently used browser DOM APIs.', 7)
) as v(technology_slug, name, slug, description, display_order)
join public.cheatsheet_technologies t on t.slug = v.technology_slug
on conflict (technology_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;
