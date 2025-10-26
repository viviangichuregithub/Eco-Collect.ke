"""rename centres to centers

Revision ID: b269d29f9a55
Revises: 10c40808ea45
Create Date: 2025-10-26 10:45:25.628261

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b269d29f9a55'
down_revision = '10c40808ea45'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.rename_table('centres', 'centers')


def downgrade() -> None:
    op.rename_table('centers', 'centres')