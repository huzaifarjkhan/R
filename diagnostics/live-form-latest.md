# Solarist live form verification

- Checked: `2026-07-30T00:47:41.685Z`
- Result: **FAIL**
- Detail: TimeoutError: page.selectOption: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('#service')
    - locator resolved to <select id="service" name="service">…</select>
  - attempting select option action
    2 × waiting for element to be visible and enabled
      - did not find some options
    - retrying select option action
    - waiting 20ms
    2 × waiting for element to be visible and enabled
      - did not find some options
    - retrying select option action
      - waiting 100ms
    60 × waiting for element to be visible and enabled
       - did not find some options
     - retrying select option action
       - waiting 500ms

- Visible form status: None
