DELETE FROM public.note WHERE opened_by='test-functional-subaccount-admin@tekvizion360.com' AND open_date < (CURRENT_TIMESTAMP - INTERVAL '1 hour' );
DELETE FROM public.customer WHERE name LIKE 'functional-test-%';