# Data Retention and Deletion

Journey data remains on the device until explicitly edited or deleted. Manual mock sync changes outbox status only and sends nothing to a production service. JSON exports are ordinary files controlled by the destination chosen by the user.

Deleting a journey cascades its journal/completion records. Delete All removes all user-created records, settings, and outbox data. Bundled fictional guide content is application content and remains available.
