<?php

/**
 * Directus – <http://getdirectus.com>
 *
 * @link      The canonical repository – <https://github.com/directus/directus>
 * @copyright Copyright 2006-2017 RANGER Studio, LLC – <http://rangerstudio.com>
 * @license   GNU General Public License (v3) – <http://www.gnu.org/copyleft/gpl.html>
 */

namespace Directus\Exception;

/**
 * Exception for Forbidden actions
 *
 * @author Welling Guzmán <welling@rngr.org>
 */
class ForbiddenException extends HttpException
{
    protected $httpStatus = 403;
}
